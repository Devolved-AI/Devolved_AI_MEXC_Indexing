//base url
export const base_url: any = process.env.NEXT_PUBLIC_BASE_URL;

// auth urls
export const auth_register: any = `${base_url}/auth/register`;
export const auth_login: any = `${base_url}/auth/login`;
export const auth_logout: any = `${base_url}/auth/logout`;
export const send_reset_password_mail: any = `${base_url}/auth/sendResetPasswordMail`;
export const reset_password: any = `${base_url}/auth/resetPassword`;
export const authEmail: any = `${base_url}/auth/authEmail`;
export const verify: any = `${base_url}/auth/verify`;
export const isValid: any = `${base_url}/user/isValid`;



export const profile: any = `${base_url}/user/profile`;

// verify contract
export const verify_contract: any = `${base_url}/contract/verify-contract`;
export const get_users_all_contract: any = `${base_url}/contract/getAllUserContracts`;
export const get_users_contract_details: any = `${base_url}/contract/getContractDetails`;
