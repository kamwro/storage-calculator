export const AUTH_SERVICE = Symbol('AUTH_SERVICE');
export const USERS_SERVICE = Symbol('USERS_SERVICE');
export const ITEM_TYPES_SERVICE = Symbol('ITEM_TYPES_SERVICE');
export const CONTAINERS_SERVICE = Symbol('CONTAINERS_SERVICE');
export const ITEMS_SERVICE = Symbol('ITEMS_SERVICE');
export const CALCULATOR_SERVICE = Symbol('CALCULATOR_SERVICE');
export const CARGO_CLIENT = Symbol('CARGO_CLIENT');

export type AuthServiceToken = typeof AUTH_SERVICE;
export type UsersServiceToken = typeof USERS_SERVICE;
export type ItemTypesServiceToken = typeof ITEM_TYPES_SERVICE;
export type ContainersServiceToken = typeof CONTAINERS_SERVICE;
export type ItemsServiceToken = typeof ITEMS_SERVICE;
export type CalculatorServiceToken = typeof CALCULATOR_SERVICE;
export type CargoClientToken = typeof CARGO_CLIENT;
