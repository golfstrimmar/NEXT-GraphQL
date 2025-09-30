"use client";
import React, { useEffect } from "react";

const GoogleFontsImporter = ({ importString }) => {
  useEffect(() => {
    if (!importString) {
      console.log("❌ No import string provided");
      return;
    }

    // Извлекаем URL из @import строки
    const urlMatch = importString.match(/@import url\('([^']+)'\);/);
    if (!urlMatch) {
      console.error("❌ Failed to parse import string:", importString);
      return;
    }

    const fontsUrl = urlMatch[1];

    console.log("🌐 Loading Google Fonts from:", fontsUrl);

    // Проверяем не загружен ли уже этот шрифт
    const existingLink = document.querySelector(`link[href="${fontsUrl}"]`);
    if (existingLink) {
      console.log("✅ Fonts already loaded, skipping...");
      return;
    }

    // Создаем link элемент
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontsUrl;

    link.onload = () => console.log("✅ Google Fonts loaded successfully");
    link.onerror = (e) => {
      console.error("❌ Failed to load Google Fonts:", e);
      console.error("URL was:", fontsUrl);
    };

    document.head.appendChild(link);
    console.log("📥 Font link added to head");

    return () => {
      if (link && link.parentNode) {
        console.log("🧹 Cleaning up font link");
        link.parentNode.removeChild(link);
      }
    };
  }, [importString]);

  return null;
};

export default GoogleFontsImporter;
