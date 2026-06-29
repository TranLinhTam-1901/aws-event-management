import React, { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

type QRScannerProps = {
    onScanSuccess: (ticketId: string) => void;
};

export const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess }) => {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const scannedRef = useRef(false);

    useEffect(() => {
        if (scannerRef.current) return;

        const scanner = new Html5QrcodeScanner(
            "qr-reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
            },
            false
        );

        scanner.render(
            (decodedText) => {
                if (scannedRef.current) return;

                scannedRef.current = true;
                onScanSuccess(decodedText);

                setTimeout(() => {
                    scannedRef.current = false;
                }, 3000);
            },
            () => { }
        );

        scannerRef.current = scanner;

        return () => {
            scanner.clear().catch(() => { });
            scannerRef.current = null;
        };
    }, [onScanSuccess]);

    return (
        <div>
            <p className="mb-4 text-slate-600">
                Đưa mã QR trên vé vào khung camera để xác nhận người tham dự.
            </p>

            <div id="qr-reader" className="w-full" />
        </div>
    );
};