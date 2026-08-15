export interface User {
    id: number;
    name: string;
    email: string;
    phone: string
    password: string
    emailVerified?: boolean;
    role?: string;
    city?: string;
    status?: string;
    premium?: boolean;
}