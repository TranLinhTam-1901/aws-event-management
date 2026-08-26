import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { QRScanner } from "../../components/attendance/QRScanner";
import {
    ticketService,
    type CheckInResponse,
} from "../../services/ticketService";
import {
    attendeeService,
    type EventAttendeesResponse,
} from "../../services/attendeeService";
import axiosInstance from "../../services/axiosInstance";

interface EventOption {
    eventId: string;
    title: string;
    startTime?: string;
}

interface RawEvent {
    eventId?: string;
    EventId?: string;
    title?: string;
    Title?: string;
    startTime?: string;
    StartTime?: string;
}

type EventsApiResponse =
    | RawEvent[]
    | {
        events?: RawEvent[];
        items?: RawEvent[];
        data?: RawEvent[];
    };

export const CheckInPage: React.FC = () => {
    const [events, setEvents] = useState<EventOption[]>([]);
    const [selectedEventId, setSelectedEventId] = useState("");

    const [attendeeData, setAttendeeData] =
        useState<EventAttendeesResponse | null>(null);

    const [result, setResult] =
        useState<CheckInResponse | null>(null);

    const [loadingEvents, setLoadingEvents] = useState(true);
    const [loadingAttendees, setLoadingAttendees] = useState(false);
    const [processingCheckIn, setProcessingCheckIn] = useState(false);

    const [eventsError, setEventsError] = useState("");
    const [attendeesError, setAttendeesError] = useState("");

    const processingRef = useRef(false);
    const selectedEventIdRef = useRef("");

    useEffect(() => {
        selectedEventIdRef.current = selectedEventId;
    }, [selectedEventId]);

    const getCheckInErrorMessage = (error: unknown): string => {
        const apiError = error as {
            response?: {
                status?: number;
                data?: {
                    message?: string;
                };
            };
        };

        const status = apiError.response?.status;
        const apiMessage = apiError.response?.data?.message;

        if (status === 400 || status === 409) {
            if (
                apiMessage?.toLowerCase().includes("checked") ||
                apiMessage?.toLowerCase().includes("check-in")
            ) {
                return "Vé này đã được check-in trước đó.";
            }

            return apiMessage || "Không thể check-in vé này.";
        }

        if (status === 404) {
            return "Không tìm thấy vé.";
        }

        if (!apiError.response) {
            return "Không thể kết nối đến máy chủ.";
        }

        return "Đã xảy ra lỗi hệ thống. Vui lòng thử lại.";
    };

    const loadAttendees = useCallback(async (eventId: string) => {
        if (!eventId) {
            setAttendeeData(null);
            return;
        }

        setLoadingAttendees(true);
        setAttendeesError("");

        try {
            const data =
                await attendeeService.getEventAttendees(eventId);

            setAttendeeData(data);
        } catch (error) {
            console.error(
                "Không thể tải danh sách người tham dự:",
                error
            );

            setAttendeeData(null);
            setAttendeesError(
                "Không thể tải danh sách người tham dự."
            );
        } finally {
            setLoadingAttendees(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        const fetchEvents = async () => {
            setLoadingEvents(true);
            setEventsError("");

            try {
                const response = await axiosInstance.get<EventsApiResponse>("/events");
                const responseData = response.data;

                let rawEvents: RawEvent[] = [];

                if (Array.isArray(responseData)) {
                    rawEvents = responseData;
                } else {
                    rawEvents = responseData.events ?? responseData.items ?? responseData.data ?? [];
                }

                const mappedEvents = rawEvents
                    .map((event): EventOption | null => {
                        const eventId = event.eventId ?? event.EventId;
                        const title = event.title ?? event.Title;
                        const startTime = event.startTime ?? event.StartTime;

                        if (!eventId || !title) {
                            return null;
                        }

                        return {
                            eventId,
                            title,
                            startTime,
                        };
                    })
                    .filter((event): event is EventOption => event !== null)
                    .sort((first, second) => {
                        if (!first.startTime || !second.startTime) {
                            return 0;
                        }

                        return new Date(first.startTime).getTime() - new Date(second.startTime).getTime();
                    });

                if (isMounted) {
                    setEvents(mappedEvents);
                    if (mappedEvents.length > 0) {
                        setSelectedEventId((current) => current || mappedEvents[0].eventId);
                    }
                }
            } catch (error) {
                console.error("Không thể tải sự kiện:", error);
                if (isMounted) {
                    setEventsError("Không thể tải danh sách sự kiện.");
                }
            } finally {
                if (isMounted) {
                    setLoadingEvents(false);
                }
            }
        };

        void fetchEvents();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        const fetchAttendees = async () => {
            if (!selectedEventId) {
                if (isMounted) {
                    setAttendeeData(null);
                }
                return;
            }

            setLoadingAttendees(true);
            setAttendeesError("");

            try {
                const data = await attendeeService.getEventAttendees(selectedEventId);
                if (isMounted) {
                    setAttendeeData(data);
                }
            } catch (error) {
                console.error("Không thể tải danh sách người tham dự:", error);
                if (isMounted) {
                    setAttendeeData(null);
                    setAttendeesError("Không thể tải danh sách người tham dự.");
                }
            } finally {
                if (isMounted) {
                    setLoadingAttendees(false);
                }
            }
        };

        void fetchAttendees();

        return () => {
            isMounted = false;
        };
    }, [selectedEventId]);

    const handleScanSuccess = useCallback(
        async (rawValue: string) => {
            const ticketId = rawValue.trim();

            if (!ticketId || processingRef.current) {
                return;
            }

            processingRef.current = true;
            setProcessingCheckIn(true);
            setResult(null);

            try {
                const data =
                    await ticketService.checkInTicket(
                        ticketId,
                        "QR"
                    );

                setResult(data);

                const currentEventId =
                    selectedEventIdRef.current;

                if (data.success && currentEventId) {
                    await loadAttendees(currentEventId);
                }
            } catch (error) {
                console.error("Check-in error:", error);

                setResult({
                    success: false,
                    message: getCheckInErrorMessage(error),
                    ticketId,
                });
            } finally {
                setProcessingCheckIn(false);

                window.setTimeout(() => {
                    processingRef.current = false;
                }, 3000);
            }
        },
        [loadAttendees]
    );

    const formatDateTime = (
        value?: string | null
    ): string => {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return new Intl.DateTimeFormat("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        }).format(date);
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900">
                    Check-in sự kiện
                </h1>

                <p className="mt-2 text-slate-600">
                    Chọn sự kiện, xem danh sách người tham dự và
                    quét mã QR để check-in.
                </p>
            </div>

            <div className="mb-6 rounded-2xl bg-white p-6 shadow">
                <label
                    htmlFor="event-selector"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                >
                    Chọn sự kiện
                </label>

                {loadingEvents ? (
                    <p className="text-slate-500">
                        Đang tải danh sách sự kiện...
                    </p>
                ) : eventsError ? (
                    <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
                        {eventsError}
                    </div>
                ) : events.length === 0 ? (
                    <p className="text-slate-500">
                        Hiện chưa có sự kiện.
                    </p>
                ) : (
                    <select
                        id="event-selector"
                        value={selectedEventId}
                        onChange={(event) =>
                            setSelectedEventId(
                                event.target.value
                            )
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                    >
                        {events.map((event) => (
                            <option
                                key={event.eventId}
                                value={event.eventId}
                            >
                                {event.title}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
                <div className="rounded-2xl bg-white p-6 shadow xl:col-span-1">
                    <h2 className="mb-4 text-xl font-bold">
                        Quét mã QR
                    </h2>

                    <QRScanner
                        onScanSuccess={handleScanSuccess}
                    />

                    {processingCheckIn && (
                        <div className="mt-4 rounded-xl bg-blue-50 p-4 text-center font-medium text-blue-700">
                            Đang xử lý check-in...
                        </div>
                    )}

                    {result && (
                        <div
                            className={`mt-4 rounded-xl border p-4 ${result.success
                                    ? "border-green-300 bg-green-50 text-green-800"
                                    : "border-red-300 bg-red-50 text-red-800"
                                }`}
                        >
                            <h3 className="font-bold">
                                {result.success ? "✅ " : "❌ "}
                                {result.message}
                            </h3>

                            <div className="mt-3 space-y-1 text-sm">
                                <p>
                                    <b>Ticket ID:</b>{" "}
                                    {result.ticketId}
                                </p>

                                {result.userFullName && (
                                    <p>
                                        <b>Người tham dự:</b>{" "}
                                        {result.userFullName}
                                    </p>
                                )}

                                {result.userEmail && (
                                    <p>
                                        <b>Email:</b>{" "}
                                        {result.userEmail}
                                    </p>
                                )}

                                {result.eventTitle && (
                                    <p>
                                        <b>Sự kiện:</b>{" "}
                                        {result.eventTitle}
                                    </p>
                                )}

                                {result.checkInAt && (
                                    <p>
                                        <b>Thời gian:</b>{" "}
                                        {formatDateTime(
                                            result.checkInAt
                                        )}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6 xl:col-span-2">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl bg-white p-5 shadow">
                            <p className="text-sm text-slate-500">
                                Tổng đăng ký
                            </p>
                            <p className="mt-2 text-3xl font-bold text-slate-900">
                                {attendeeData?.total ?? 0}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white p-5 shadow">
                            <p className="text-sm text-slate-500">
                                Đã check-in
                            </p>
                            <p className="mt-2 text-3xl font-bold text-green-600">
                                {attendeeData?.checkedIn ?? 0}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white p-5 shadow">
                            <p className="text-sm text-slate-500">
                                Chưa check-in
                            </p>
                            <p className="mt-2 text-3xl font-bold text-amber-600">
                                {attendeeData?.notCheckedIn ?? 0}
                            </p>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl bg-white shadow">
                        <div className="border-b border-slate-200 p-5">
                            <h2 className="text-xl font-bold">
                                Danh sách người tham dự
                            </h2>
                        </div>

                        {loadingAttendees ? (
                            <div className="p-8 text-center text-slate-500">
                                Đang tải danh sách...
                            </div>
                        ) : attendeesError ? (
                            <div className="m-5 rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
                                {attendeesError}
                            </div>
                        ) : !selectedEventId ? (
                            <div className="p-8 text-center text-slate-500">
                                Vui lòng chọn sự kiện.
                            </div>
                        ) : !attendeeData ||
                            attendeeData.attendees.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                Chưa có người đăng ký sự kiện này.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                                Họ tên
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                                Email
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                                Ticket ID
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                                Trạng thái
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                                                Check-in lúc
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {attendeeData.attendees.map(
                                            (attendee) => (
                                                <tr
                                                    key={
                                                        attendee.ticketId
                                                    }
                                                    className="hover:bg-slate-50"
                                                >
                                                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-900">
                                                        {attendee.userFullName ||
                                                            "—"}
                                                    </td>

                                                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                                                        {attendee.userEmail ||
                                                            "—"}
                                                    </td>

                                                    <td className="max-w-xs break-all px-4 py-4 text-sm text-slate-600">
                                                        {
                                                            attendee.ticketId
                                                        }
                                                    </td>

                                                    <td className="whitespace-nowrap px-4 py-4">
                                                        {attendee.status ===
                                                            "CHECKED_IN" ? (
                                                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                                Đã check-in
                                                            </span>
                                                        ) : (
                                                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                                                Chưa check-in
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                                                        {formatDateTime(
                                                            attendee.checkInAt
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};