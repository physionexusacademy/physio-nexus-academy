import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { addGalleryItem, deleteGalleryItem } from "./actions";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";

export default async function AdminGalleryPage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("gallery_items")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy-800">Gallery</h1>
      <p className="mt-1 text-sm text-navy-400">Workshop photos, events and academy media.</p>

      <form action={addGalleryItem} className="mt-6 flex flex-wrap items-end gap-4 rounded-xl border border-grey-200 bg-white p-5" encType="multipart/form-data">
        <div>
          <label className="label">Image</label>
          <input name="image" type="file" accept="image/*" required className="input" />
        </div>
        <div>
          <label className="label">Caption</label>
          <input name="caption" className="input" />
        </div>
        <div>
          <label className="label">Category</label>
          <input name="category" placeholder="Workshops, Events..." className="input" />
        </div>
        <button type="submit" className="rounded-md bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-600">
          Upload
        </button>
      </form>

      <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items?.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-xl border border-grey-200 bg-white">
            <div className="relative aspect-square">
              <Image src={item.image_url} alt={item.caption ?? ""} fill className="object-cover" />
            </div>
            <div className="p-3">
              <p className="truncate text-xs text-navy-500">{item.caption || "Untitled"}</p>
              <form action={deleteGalleryItem} className="mt-1">
                <input type="hidden" name="id" value={item.id} />
                <ConfirmSubmitButton confirmMessage="Remove this photo?" className="text-xs font-semibold text-red-600 hover:underline">
                  Delete
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ))}
        {!items?.length && (
          <p className="col-span-full rounded-xl border border-grey-200 bg-white p-8 text-center text-navy-400">
            No photos uploaded yet.
          </p>
        )}
      </div>
    </div>
  );
}
