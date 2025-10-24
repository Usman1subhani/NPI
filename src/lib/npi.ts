// api/npi.ts
import axios from "axios";

interface FetchNpiDataParams {
	state?: string;
	zip?: string;
	enumerationType?: string;
	startDate?: string;
	endDate?: string;
	page?: number;
	limit?: number;
}

export async function fetchNpiData(options: FetchNpiDataParams) {
	const { zip, enumerationType, startDate, endDate, page = 1, limit = 25 } = options;

	const params: any = { page, limit };
	if (zip) params.zip = zip;
	if (enumerationType) params.enumerationType = enumerationType;
	if (startDate) params.startDate = startDate;
	if (endDate) params.endDate = endDate;

	// 👇 Always get token from localStorage
	const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;

	// const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get-npi-data`, {
		const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/get-npi-data`, {
		params,
		headers: token ? { Authorization: `Bearer ${token}` } : {},
	});

	return res.data;
}
