
export interface Env {
	// If you set another name in wrangler.toml as the value for 'binding',
	// replace "DB" with the variable name you defined.
	DB: D1Database;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const { pathname } = new URL(request.url);

		// Handle CORS headers
		const addCorsHeaders = (response: Response) => {
			const modifiedResponse = new Response(response.body, response);
			modifiedResponse.headers.set('Access-Control-Allow-Origin', '*'); // Change '*' to your specific origin if needed
			modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
			modifiedResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
			return modifiedResponse;
		};

		// Handle preflight requests
		if (request.method === 'OPTIONS') {
			return addCorsHeaders(new Response(null, {
				status: 204,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization',
				},
			}));
		}

		const doctorFilesPattern = /^\/api\/doctor\/([^\/]+)\/get-files$/;
		const doctorMatch = pathname.match(doctorFilesPattern);

		const userFilePattern = /^\/api\/patient\/([^\/]+)\/get-info/;
		const userFileMatch = pathname.match(userFilePattern);

		console.log(userFileMatch);

		if (doctorMatch) {
			const { results } = await env.DB.prepare(
				`
SELECT
    Patients.FilePath, Patients.FirstName, Patients.LastName, Patients.PatientID
FROM
    Patients
INNER JOIN
    Physicians
ON
    Patients.PhysicianID = Physicians.Email
WHERE
    Physicians.Email = ?;
`,
			)
				.bind(doctorMatch[1])
				.all();

			return addCorsHeaders(Response.json(results)); // Add CORS headers to the response
		}

		if (userFileMatch) {
			const result = await env.DB.prepare(
				`
SELECT
    *
FROM
    Patients
WHERE
    PatientID = ?;
`,
			)
				.bind(userFileMatch[1])
				.first();

			return addCorsHeaders(Response.json(result)); // Add CORS headers to the response
		}

		return addCorsHeaders(new Response('Call /api/beverages to see everyone who works at Bs Beverages')); // Add CORS headers here
	},
} satisfies ExportedHandler<Env>;
