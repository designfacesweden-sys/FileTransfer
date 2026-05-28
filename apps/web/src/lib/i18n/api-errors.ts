/** Maps English API error strings to Swedish for the UI */
const MAP: Record<string, string> = {
	'Invalid request': 'Ogiltig begäran',
	'Password protection requires Standard or Enterprise':
		'Lösenordsskydd kräver Standard eller Enterprise',
	'Database unavailable. Check API logs and Supabase connection settings.':
		'Databasen är inte tillgänglig. Kontrollera API-loggar och Supabase.',
	'Transfer not found': 'Överföringen hittades inte',
	'Transfer expired': 'Överföringen har gått ut',
	'Password required': 'Lösenord krävs',
	'Invalid password': 'Fel lösenord',
	'File not found': 'Filen hittades inte',
	'Not found': 'Hittades inte',
	'Email is not configured. Add RESEND_API_KEY to apps/api/.env.':
		'E-post är inte konfigurerat. Lägg till RESEND_API_KEY i apps/api/.env.',
	'This transfer has no recipient email': 'Den här överföringen har ingen mottagar-e-post',
	'Upload files before sending email': 'Ladda upp filer innan du skickar e-post',
	'Your support request has been received. We will get back to you soon.':
		'Din supportförfrågan är mottagen. Vi återkommer så snart vi kan.'
};

export function translateApiError(message: string): string {
	return MAP[message] ?? message;
}
