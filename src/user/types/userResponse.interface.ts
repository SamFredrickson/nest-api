import { UserType } from "./user.type";

export interface UserResponseIntreface {
    user: UserType & { token: string };
}