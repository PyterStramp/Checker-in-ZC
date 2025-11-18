export default function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Buscar por nombre o por ID"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="flex flex-col sm:flex-row gap-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
      />
    </div>
  );
}
