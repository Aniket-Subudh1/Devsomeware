"use server"
import { cookies } from "next/headers"
const Logout = async () => {
    const cookie = await cookies();
    cookie.delete("token");
    return true;

}
export default Logout;