declare namespace jest {
  interface Matchers<R> {
    toBe(expected: any): R
    toEqual(expected: any): R
    toBeTruthy(): R
    toBeFalsy(): R
    toBeNull(): R
    toBeUndefined(): R
    toBeDefined(): R
    toContain(expected: any): R
    toHaveBeenCalled(): R
    toHaveBeenCalledWith(...args: any[]): R
    toHaveBeenCalledTimes(expected: number): R
    toThrow(expected?: string | RegExp | Error): R
  }
}