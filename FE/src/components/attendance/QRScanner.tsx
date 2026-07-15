import React, { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

type QRScannerProps = {
    onScanSuccess: (
        ticketId: string
    ) => void | Promise<void>;
};

export const QRScanner: React.FC<QRScannerProps> = ({
    onScanSuccess,
}) => {
    const scannedRef = useRef(false);
    const onScanSuccessRef = useRef(onScanSuccess);

    useEffect(() => {
        onScanSuccessRef.current = onScanSuccess;
    }, [onScanSuccess]);

    useEffect(() => {
        let disposed = false;

        const scanner = new Html5QrcodeScanner(
            "qr-reader",
            {
                fps: 10,
                qrbox: {
                    width: 250,
                    height: 250,
                },
            },
            false
        );

        scanner.render(
            async (decodedText) => {
                if (disposed || scannedRef.current) {
                    return;
                }

                const ticketId = decodedText.trim();

                if (!ticketId) {
                    return;
                }

                console.log("[QR SUCCESS]", ticketId);

                scannedRef.current = true;

                try {
                    await onScanSuccessRef.current(ticketId);
                } catch (error) {
                    console.error(
                        "[QR CHECK-IN ERROR]",
                        error
                    );
                } finally {
                    window.setTimeout(() => {
                        scannedRef.current = false;
                    }, 3000);
                }
            },
            () => {
                // Không log lỗi mỗi frame khi chưa nhận được QR.
            }
        );

        return () => {
            disposed = true;

            const container =
                document.getElementById("qr-reader");

            if (!container) {
                return;
            }

            scanner.clear().catch((error) => {
                console.warn(
                    "Scanner đã được dọn trước đó:",
                    error
                );
            });
        };
    }, []);

    return (
        <div>
            <p className="mb-4 text-slate-600">
                Đưa mã QR trên vé vào khung camera để xác nhận
                người tham dự.
            </p>

            <div
                id="qr-reader"
                className="w-full overflow-hidden rounded-xl border border-slate-200"
            />
        </div>
    );
};