import "./public.js";
//#region src/lib/i18n/api-errors.ts
/** Maps English API error strings to Swedish for the UI */
var MAP = {
	"Invalid request": "Ogiltig begäran",
	"Password protection requires Standard or Enterprise": "Lösenordsskydd kräver Standard eller Enterprise",
	"Database unavailable. Check API logs and Supabase connection settings.": "Databasen är inte tillgänglig. Kontrollera API-loggar och Supabase.",
	"Transfer not found": "Överföringen hittades inte",
	"Transfer expired": "Överföringen har gått ut",
	"Password required": "Lösenord krävs",
	"Invalid password": "Fel lösenord",
	"File not found": "Filen hittades inte",
	"Not found": "Hittades inte",
	"Email is not configured. Add RESEND_API_KEY to apps/api/.env.": "E-post är inte konfigurerat. Lägg till RESEND_API_KEY i apps/api/.env.",
	"This transfer has no recipient email": "Den här överföringen har ingen mottagar-e-post",
	"Upload files before sending email": "Ladda upp filer innan du skickar e-post",
	"Your support request has been received. We will get back to you soon.": "Din supportförfrågan är mottagen. Vi återkommer så snart vi kan."
};
function translateApiError(message) {
	return MAP[message] ?? message;
}
//#endregion
//#region src/lib/api.ts
var base = "http://localhost:3001";
async function getTransfer(token, password) {
	const params = password ? `?password=${encodeURIComponent(password)}` : "";
	const res = await fetch(`${base}/api/transfers/${token}${params}`);
	if (!res.ok) {
		const err = await res.json().catch(() => ({}));
		throw new Error(translateApiError(err.error ?? "Kunde inte ladda överföringen"));
	}
	return res.json();
}
function downloadUrl(fileId, password) {
	return `${base}/api/downloads/${fileId}${password ? `?password=${encodeURIComponent(password)}` : ""}`;
}
//#endregion
export { getTransfer as n, downloadUrl as t };
