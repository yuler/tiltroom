import QRCode from "qrcode";
import { useEffect, useState } from "react";

interface TestFlightQrProps {
  url: string;
  size?: number;
}

export function TestFlightQr({ url, size = 156 }: TestFlightQrProps) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(url, {
      width: size * 2,
      margin: 1,
      color: {
        dark: "#1d1d1f",
        light: "#ffffff",
      },
    })
      .then((out) => {
        if (active) setDataUrl(out);
      })
      .catch(() => {
        if (active) setDataUrl("");
      });
    return () => {
      active = false;
    };
  }, [url, size]);

  return (
    <div className="inline-flex flex-col items-center rounded-3xl border border-black/10 bg-white p-4 shadow-sm">
      {dataUrl ? (
        <img
          src={dataUrl}
          alt="TestFlight 安装二维码"
          width={size}
          height={size}
          className="rounded-xl"
        />
      ) : (
        <div
          style={{ width: size, height: size }}
          className="flex items-center justify-center rounded-xl bg-muted text-xs text-muted-foreground"
        >
          生成二维码中...
        </div>
      )}
      <span className="mt-2.5 text-xs font-medium text-muted-foreground">
        用 iPhone 相机扫码直达 TestFlight
      </span>
    </div>
  );
}
