export const isProdEnvironment = (): boolean => {
	return (
		process.env.NODE_ENV === "prod" || process.env.NODE_ENV === "production"
	);
};
