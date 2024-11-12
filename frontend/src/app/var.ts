//base url
export const base_url: any = process.env.NEXT_PUBLIC_BASE_URL;

// auth urls
export const auth_register: any = `${base_url}/auth/register`;
export const auth_login: any = `${base_url}/auth/login`;
export const auth_logout: any = `${base_url}/auth/logout`;

// verify contract
export const verify_contract: any = `${base_url}/contract/verify-contract`;
export const get_users_all_contract: any = `${base_url}/contract/getAllUserContracts`;
export const get_users_contract_details: any = `${base_url}/contract/getContractDetails`;
