type ControllerFn<ResBody = unknown> = (
	req: import("express").Request,
	res: import("express").Response<ResBody>,
) => Promise<void>;
