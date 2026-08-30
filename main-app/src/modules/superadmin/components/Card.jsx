const Card = ({ title, children }) => (
    <div className="bg-white p-4 md:p-6 rounded-2xl shadow overflow-hidden">
        <h2 className="text-base md:text-lg font-semibold mb-4">
            {title}
        </h2>

        <div className="w-full">
            {children}
        </div>
    </div>
);

export default Card;