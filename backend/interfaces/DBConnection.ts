export interface IDatabase {
    query(text: string, params?: any[]): Promise<any>;
    getClient(): Promise<IDatabaseClient>;
}

export interface IDatabaseClient {
    query(text: string, params?: any[]): Promise<any>;
    release(): void;
}