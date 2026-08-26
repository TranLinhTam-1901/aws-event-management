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
    const scannerRef =
        useRef<Html5QrcodeScanner | null>(null);

    const scannedRef = useRef(false);
    const onScanSuccessRef = useRef(onScanSuccess);

    useEffect(() => {
        onScanSuccessRef.current = onScanSuccess;
    }, [onScanSuccess]);

    useEffect(() => {
        if (scannerRef.current) {
            return;
        }

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
                if (scannedRef.current) {
                    return;
                }

                const ticketId = decodedText.trim();

                if (!ticketId) {
                    return;
                }

                scannedRef.current = true;

                try {
                    await onScanSuccessRef.current(ticketId);
                } catch (error) {
                    console.error("QR scan handling error:", error);
                } finally {
                    window.setTimeout(() => {
                        scannedRef.current = false;
                    }, 3000);
                }
            },
            () => {
                // Bỏ qua lỗi quét liên tục khi camera chưa nhận diện được QR.
            }
        );

        scannerRef.current = scanner;

        return () => {
            const currentScanner = scannerRef.current;

            scannerRef.current = null;
            scannedRef.current = false;

            if (currentScanner) {
                currentScanner.clear().catch((error) => {
                    console.warn(
                        "Không thể dừng QR scanner:",
                        error
                    );
                });
            }
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