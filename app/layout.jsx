import "../src/styles.css";

export const metadata = {
  title: "VitaForge",
  description: "Private wellness journal and lifestyle insight dashboard"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
