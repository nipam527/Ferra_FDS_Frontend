import { useState } from "react";

function EditOrderForm({ order, onCancel, onSubmit }) {
  const [items, setItems] = useState(
    order.items.map((i) => ({
      menuItem: i.menuItem, // ObjectId string
      name: i.name,
      price: i.price,
      quantity: i.quantity,
    }))
  );
  const [submitting, setSubmitting] = useState(false);

  const updateQty = (menuItemId, delta) => {
    setItems((prev) =>
      prev
        .map((it) =>
          it.menuItem === menuItemId
            ? { ...it, quantity: it.quantity + delta }
            : it
        )
        .filter((it) => it.quantity > 0) // dropping to 0 removes the item
    );
  };

  const handleSubmit = async () => {
    if (items.length === 0) return; // block empty order client-side too
    setSubmitting(true);
    try {
      await onSubmit(items);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <p className="mb-3 text-[12.5px] font-medium text-stone-600">Edit items</p>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.menuItem} className="flex items-center justify-between text-[13.5px]">
            <span className="text-stone-700">{item.name}</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => updateQty(item.menuItem, -1)}
                className="flex items-center justify-center w-6 h-6 border rounded-full border-stone-200 text-stone-600 hover:bg-stone-50"
              >
                −
              </button>
              <span className="w-4 text-center tabular-nums">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQty(item.menuItem, 1)}
                className="flex items-center justify-center w-6 h-6 border rounded-full border-stone-200 text-stone-600 hover:bg-stone-50"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <p className="mt-3 text-[12.5px] text-red-500">
          Your order needs at least one item. Cancel the order instead if you want to remove everything.
        </p>
      )}

      <div className="mt-5 flex gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 rounded-full border border-stone-200 py-2.5 text-[13.5px] font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
        >
          Discard
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || items.length === 0}
          className="flex-1 rounded-full bg-stone-900 py-2.5 text-[13.5px] font-medium text-white hover:bg-stone-800 disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}

export default EditOrderForm;