import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

interface CartItem {
  id: string;
  title: string;
  brand: string;
  capacity?: string;
  price: number;
  quantity: number;
  imageSrc: string;
  imageAlt: string;
}

interface CartItemCardProps {
  item: CartItem;
  note: string;
  showNote: boolean;
  onNoteChange: (note: string) => void;
  onToggleNote: () => void;
}

export function CartItemCard({
  item,
  note,
  showNote,
  onNoteChange,
  onToggleNote,
}: CartItemCardProps) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex gap-4">
        <div className=" aspect-square h-full p-4">
          {" "}
          <Image
            src={item.imageSrc}
            alt={item.imageAlt}
            className="object-contain h-full mix-blend-multiply"
          />
        </div>

        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{item.title}</h3>
          <p className="text-sm text-gray-600">{item.brand}</p>
          {item.capacity && (
            <p className="text-sm text-gray-600">{item.capacity}</p>
          )}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Qty: {item.quantity}
              </span>
              <span className="font-medium">
                Rp {item.price.toLocaleString("id-ID")}
              </span>
            </div>
            <button
              type="button"
              onClick={onToggleNote}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {showNote ? "Sembunyikan Catatan" : "Tambah Catatan"}
            </button>
          </div>
        </div>
      </div>

      {/* Note section - hidden by default */}
      {showNote && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Label
            htmlFor={`note-${item.id}`}
            className="text-sm font-medium text-gray-700"
          >
            Catatan untuk {item.title}
          </Label>
          <Textarea
            id={`note-${item.id}`}
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Catatan khusus untuk item ini (opsional)"
            rows={2}
            className="mt-1"
          />
        </div>
      )}
    </div>
  );
}
