export default function SearchBar({ search, onSearchChange, category, onCategoryChange }) {
  return (
    <div className="search-bar">
      <label className="search-field">
        <span className="sr-only">Search products</span>
        <span className="search-icon">⌕</span>
        <input type="search" placeholder="Search by product name" value={search} onChange={(event) => onSearchChange(event.target.value)} />
      </label>
      <label className="category-field">
        <span className="sr-only">Filter by category</span>
        <select value={category} onChange={(event) => onCategoryChange(event.target.value)}>
          <option value="">All categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Fashion">Fashion</option>
          <option value="Books">Books</option>
          <option value="Home">Home</option>
        </select>
      </label>
    </div>
  );
}
