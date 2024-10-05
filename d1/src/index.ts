
export interface Env {
	// If you set another name in wrangler.toml as the value for 'binding',
	// replace "DB" with the variable name you defined.
	DB: D1Database;
}

export default {
	async fetch(request, env): Promise<Response> {
		const { pathname } = new URL(request.url);

		const doctorFilesPattern = /^\/api\/doctor\/([^\/]+)\/get-files$/;
		const doctorMatch = pathname.match(doctorFilesPattern);

		if (doctorMatch) {
			// If you did not use `DB` as your binding name, change it here
			//
			console.log(doctorMatch[1]);
			const { results } = await env.DB.prepare(
				`
SELECT
    Patients.FilePath
FROM
    Patients
INNER JOIN
    Physicians
ON
    Patients.PhysicianID = Physicians.Email
WHERE
    Physicians.Email = ?;


`)
				.bind(doctorMatch[1])
				.all();


			console.log(results);
			return Response.json(results);
		}








		return new Response(
			"Call /api/beverages to see everyone who works at Bs Beverages",
		);
	},
} satisfies ExportedHandler<Env>;
