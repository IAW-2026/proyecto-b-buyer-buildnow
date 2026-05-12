import StoreQuickViewRow from "./StoreQuickViewRow";

const stores = [
  {
    id: 1,
    name: "Corralón San Martín",
  },
  {
    id: 2,
    name: "Materiales del Norte",
  },
  {
    id: 3,
    name: "ConstruSur",
  },
];

export default function StoreQuickViewList() {
  return (
    <div className="space-y-4">
      {stores.map((store) => (
        <StoreQuickViewRow
          key={store.id}
          name={store.name}
        />
      ))}
    </div>
  );
}