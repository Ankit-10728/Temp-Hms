export function Grid({ children }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {children}
        </div>
    );
}

export function Full({ children }) {
    return (
        <div className="col-span-1 lg:col-span-2 w-full">
            {children}
        </div>
    );
}