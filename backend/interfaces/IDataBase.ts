export interface IDatabase {
    query(text: string, params?: any[]): Promise<any>;
}

