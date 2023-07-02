export type UserSession = {
	CreatedAt: string | null;
	DeletedAt: string | null;
	ID: number;
	UpdatedAt: string | null;
	UserName: string;
};

export type PollGameResponse = {
	RoomID: string;
};
