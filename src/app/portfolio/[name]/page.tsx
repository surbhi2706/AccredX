"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function PortfolioPreview() {
  const [html, setHtml] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // When the component mounts, look for the stored HTML in sessionStorage
    const savedHtml = sessionStorage.getItem("portfolioHtml");
    if (savedHtml) {
      setHtml(savedHtml);
    } else {
      setHtml("<h1>Portfolio Not Found</h1><p>Please generate the portfolio from the AccredX Reports section.</p>");
    }
  }, []);

  if (html === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-gray-500 text-lg font-medium animate-pulse">Loading Portfolio...</div>
      </div>
    );
  }

  // Use an iframe to safely render the complete HTML string and encapsulate its CSS
  return (
    <iframe
      srcDoc={html}
      className="h-screen w-full border-none bg-white"
      title={`Portfolio - ${pathname}`}
    />
  );
}
