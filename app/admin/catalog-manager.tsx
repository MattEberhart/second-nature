"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus, Layers3, PackagePlus, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type AdminVariant = { id: string; label: string; size: string | null; color: string | null; image_path: string | null; unit_price_cents: number; active: boolean };
export type AdminItem = { id: string; public_name: string; category: string; material: string; description: string; image_path: string; accent: string; price_prefix: string | null; active: boolean; catalog_variants: AdminVariant[] };
export type AdminCollection = { id: string; name: string; slug: string; description: string; header_image_path: string | null; active: boolean; curated_collection_members: Array<{ product_id: string; variant_id: string | null }>; curated_collection_images: Array<{ id: string; image_path: string; alt_text: string; sort_order: number }> };

type ItemDraft = { id?: string; publicName: string; category: string; material: string; description: string; imagePath: string; accent: string; pricePrefix: string; active: boolean; variants: Array<{ id?: string; label: string; size: string; color: string; imagePath: string; unitPrice: string; active: boolean }> };
type CollectionDraft = { id?: string; name: string; slug: string; description: string; headerImagePath: string; active: boolean; members: Array<{ productId: string; variantId: string | null }>; images: Array<{ id?: string; imagePath: string; altText: string }> };

const emptyItem = (): ItemDraft => ({ publicName: "", category: "table-linens", material: "", description: "", imagePath: "/catalog/table-linens.svg", accent: "#9E9576", pricePrefix: "", active: true, variants: [{ label: "Standard", size: "", color: "", imagePath: "", unitPrice: "0.00", active: true }] });
const emptyCollection = (): CollectionDraft => ({ name: "", slug: "", description: "", headerImagePath: "", active: true, members: [], images: [] });

export function CatalogManager({ items, collections }: { items: AdminItem[]; collections: AdminCollection[] }) {
  const [mode, setMode] = useState<"items" | "collections">("items");
  const [item, setItem] = useState<ItemDraft>(emptyItem());
  const [collection, setCollection] = useState<CollectionDraft>(emptyCollection());
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  function editItem(source: AdminItem) {
    setMode("items");
    setItem({ id: source.id, publicName: source.public_name, category: source.category, material: source.material, description: source.description, imagePath: source.image_path, accent: source.accent, pricePrefix: source.price_prefix || "", active: source.active, variants: source.catalog_variants.map((variant) => ({ id: variant.id, label: variant.label, size: variant.size || "", color: variant.color || "", imagePath: variant.image_path || "", unitPrice: (variant.unit_price_cents / 100).toFixed(2), active: variant.active })) });
  }

  function editCollection(source: AdminCollection) {
    setMode("collections");
    setCollection({ id: source.id, name: source.name, slug: source.slug, description: source.description, headerImagePath: source.header_image_path || "", active: source.active, members: source.curated_collection_members.map((member) => ({ productId: member.product_id, variantId: member.variant_id })), images: source.curated_collection_images.sort((a, b) => a.sort_order - b.sort_order).map((image) => ({ id: image.id, imagePath: image.image_path, altText: image.alt_text })) });
  }

  async function upload(file: File, kind: "item" | "variant" | "collection-header" | "collection-gallery", label: string, onDone: (path: string) => void) {
    setBusy(true); setNotice("");
    const form = new FormData(); form.set("file", file); form.set("kind", kind); form.set("label", label);
    const response = await fetch("/api/admin/uploads", { method: "POST", body: form });
    const payload = await response.json();
    setBusy(false);
    if (!response.ok) return setNotice(payload.error || "Upload failed.");
    onDone(payload.path);
    setNotice("Photo uploaded. Save to keep this change.");
  }

  async function saveItem() {
    setBusy(true); setNotice("");
    const response = await fetch(item.id ? `/api/admin/inventory/${item.id}` : "/api/admin/inventory", { method: item.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...item, pricePrefix: item.pricePrefix || null, variants: item.variants.map((variant) => ({ ...variant, size: variant.size || null, color: variant.color || null, imagePath: variant.imagePath || null, unitPriceCents: Math.round(Number(variant.unitPrice) * 100) })) }) });
    const payload = await response.json(); setBusy(false);
    if (!response.ok) return setNotice(payload.error || "Item could not be saved.");
    setNotice("Item saved. Refreshing…"); window.location.reload();
  }

  async function saveCollection() {
    setBusy(true); setNotice("");
    const response = await fetch(collection.id ? `/api/admin/collections/${collection.id}` : "/api/admin/collections", { method: collection.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...collection, headerImagePath: collection.headerImagePath || null }) });
    const payload = await response.json(); setBusy(false);
    if (!response.ok) return setNotice(payload.error || "Collection could not be saved.");
    setNotice("Collection saved. Refreshing…"); window.location.reload();
  }

  async function remove(kind: "inventory" | "collections", id: string) {
    if (!window.confirm(`Delete this ${kind === "inventory" ? "item" : "collection"}? This cannot be undone.`)) return;
    setBusy(true);
    const response = await fetch(`/api/admin/${kind}/${id}`, { method: "DELETE" });
    setBusy(false);
    if (!response.ok) return setNotice("That record could not be deleted.");
    window.location.reload();
  }

  function toggleMember(productId: string, variantId: string | null) {
    const exists = collection.members.some((member) => member.productId === productId && member.variantId === variantId);
    let members = collection.members.filter((member) => !(member.productId === productId && member.variantId === variantId));
    if (!exists) {
      members = variantId === null ? members.filter((member) => member.productId !== productId) : members.filter((member) => !(member.productId === productId && member.variantId === null));
      members.push({ productId, variantId });
    }
    setCollection({ ...collection, members });
  }

  return (
    <section className="rounded-2xl bg-card p-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><p className="text-xs uppercase tracking-[0.18em] text-fig">Inventory studio</p><h2 className="mt-2 font-display text-3xl">Items, options & collections</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-ink/55">Items are reusable inventory. Options hold price and optional size/color. Curated collections can include an entire item or only selected options.</p></div>
        <div className="flex gap-2"><Button variant={mode === "items" ? "default" : "outline"} onClick={() => setMode("items")}><PackagePlus className="size-4" /> Items</Button><Button variant={mode === "collections" ? "default" : "outline"} onClick={() => setMode("collections")}><Layers3 className="size-4" /> Collections</Button></div>
      </div>
      {notice ? <button className="mt-5 w-full rounded-xl bg-olive/15 p-4 text-left text-sm" onClick={() => setNotice("")}>{notice}</button> : null}

      {mode === "items" ? <div className="mt-7 grid gap-7 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside><Button className="w-full bg-olive" onClick={() => setItem(emptyItem())}><Plus className="size-4" /> New item</Button><div className="mt-3 max-h-[720px] space-y-2 overflow-y-auto">{items.map((source) => <button key={source.id} onClick={() => editItem(source)} className={`w-full rounded-xl border p-3 text-left ${item.id === source.id ? "border-fig bg-secondary" : "border-ink/10"}`}><span className="block font-display text-lg">{source.public_name}</span><span className="mt-1 block text-xs text-ink/45">{source.category} · {source.catalog_variants.length} option{source.catalog_variants.length === 1 ? "" : "s"}</span></button>)}</div></aside>
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Public name"><Input value={item.publicName} onChange={(e) => setItem({ ...item, publicName: e.target.value })} /></Field><Field label="Material / short type"><Input value={item.material} onChange={(e) => setItem({ ...item, material: e.target.value })} /></Field><Field label="Category"><select className="mt-2 h-10 w-full rounded-md border bg-transparent px-3" value={item.category} onChange={(e) => setItem({ ...item, category: e.target.value })}>{["table-linens", "napkins", "chargers", "plates", "flatware", "custom-details"].map((value) => <option key={value}>{value}</option>)}</select></Field></div>
          <Field label="Description"><Textarea value={item.description} onChange={(e) => setItem({ ...item, description: e.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-3"><Field label="Accent color"><Input type="color" value={item.accent} onChange={(e) => setItem({ ...item, accent: e.target.value })} /></Field><Field label="Price prefix (optional)"><Input placeholder="From" value={item.pricePrefix} onChange={(e) => setItem({ ...item, pricePrefix: e.target.value })} /></Field><label className="flex items-center gap-3 pt-7 text-sm"><input type="checkbox" checked={item.active} onChange={(e) => setItem({ ...item, active: e.target.checked })} /> Visible to customers</label></div>
          <PhotoField label="Item photo" path={item.imagePath} busy={busy} onFile={(file) => upload(file, "item", item.publicName, (imagePath) => setItem({ ...item, imagePath }))} />
          <div><div className="flex items-center justify-between"><div><Label>Purchasable options</Label><p className="mt-1 text-xs text-ink/45">Size and color are optional. Use one “Standard” option when the item has no choices.</p></div><Button variant="outline" onClick={() => setItem({ ...item, variants: [...item.variants, { label: "", size: "", color: "", imagePath: "", unitPrice: "0.00", active: true }] })}><Plus className="size-4" /> Add option</Button></div><div className="mt-4 space-y-4">{item.variants.map((variant, index) => <div key={variant.id || index} className="rounded-xl border border-ink/10 p-4"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Field label="Label"><Input value={variant.label} onChange={(e) => setItem({ ...item, variants: item.variants.map((value, i) => i === index ? { ...value, label: e.target.value } : value) })} /></Field><Field label="Size (optional)"><Input value={variant.size} onChange={(e) => setItem({ ...item, variants: item.variants.map((value, i) => i === index ? { ...value, size: e.target.value } : value) })} /></Field><Field label="Color (optional)"><Input value={variant.color} onChange={(e) => setItem({ ...item, variants: item.variants.map((value, i) => i === index ? { ...value, color: e.target.value } : value) })} /></Field><Field label="Price each"><Input type="number" min="0" step="0.01" value={variant.unitPrice} onChange={(e) => setItem({ ...item, variants: item.variants.map((value, i) => i === index ? { ...value, unitPrice: e.target.value } : value) })} /></Field></div><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><label className="text-sm"><input type="checkbox" checked={variant.active} onChange={(e) => setItem({ ...item, variants: item.variants.map((value, i) => i === index ? { ...value, active: e.target.checked } : value) })} /> <span className="ml-2">Available</span></label><div className="flex gap-2"><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs"><ImagePlus className="size-4" /> {variant.imagePath ? "Replace option photo" : "Option photo"}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" disabled={busy} onChange={(e) => { const file = e.target.files?.[0]; if (file) upload(file, "variant", `${item.publicName} — ${variant.label}`, (imagePath) => setItem((current) => ({ ...current, variants: current.variants.map((value, i) => i === index ? { ...value, imagePath } : value) }))); }} /></label>{item.variants.length > 1 ? <Button variant="ghost" onClick={() => setItem({ ...item, variants: item.variants.filter((_, i) => i !== index) })}><Trash2 className="size-4" /></Button> : null}</div></div></div>)}</div></div>
          <div className="flex justify-between border-t border-ink/10 pt-5">{item.id ? <Button variant="ghost" className="text-destructive" onClick={() => remove("inventory", item.id!)}><Trash2 className="size-4" /> Delete item</Button> : <span />}<Button disabled={busy} onClick={saveItem} className="bg-fig"><Save className="size-4" /> Save item</Button></div>
        </div>
      </div> : <div className="mt-7 grid gap-7 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside><Button className="w-full bg-olive" onClick={() => setCollection(emptyCollection())}><Plus className="size-4" /> New collection</Button><div className="mt-3 space-y-2">{collections.map((source) => <button key={source.id} onClick={() => editCollection(source)} className={`w-full rounded-xl border p-3 text-left ${collection.id === source.id ? "border-fig bg-secondary" : "border-ink/10"}`}><span className="block font-display text-lg">{source.name}</span><span className="mt-1 block text-xs text-ink/45">{source.curated_collection_members.length} selection{source.curated_collection_members.length === 1 ? "" : "s"}</span></button>)}</div></aside>
        <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2"><Field label="Collection name"><Input value={collection.name} onChange={(e) => { const name = e.target.value; setCollection({ ...collection, name, slug: collection.id ? collection.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") }); }} /></Field><Field label="URL slug"><Input value={collection.slug} onChange={(e) => setCollection({ ...collection, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} /></Field></div><Field label="Collection introduction"><Textarea value={collection.description} onChange={(e) => setCollection({ ...collection, description: e.target.value })} /></Field><label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={collection.active} onChange={(e) => setCollection({ ...collection, active: e.target.checked })} /> Published</label><PhotoField label="Header image" path={collection.headerImagePath} busy={busy} onFile={(file) => upload(file, "collection-header", collection.name, (headerImagePath) => setCollection({ ...collection, headerImagePath }))} />
          <div><div className="flex items-end justify-between"><div><Label>Gallery</Label><p className="mt-1 text-xs text-ink/45">Optional editorial photos shown above the shopping experience.</p></div><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs"><ImagePlus className="size-4" /> Add photo<input type="file" className="sr-only" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(e) => { const file = e.target.files?.[0]; if (file) upload(file, "collection-gallery", collection.name, (imagePath) => setCollection((current) => ({ ...current, images: [...current.images, { imagePath, altText: "" }] }))); }} /></label></div><div className="mt-3 space-y-2">{collection.images.map((image, index) => <div key={image.id || image.imagePath} className="flex gap-2"><Input value={image.altText} placeholder="Describe this photo" onChange={(e) => setCollection({ ...collection, images: collection.images.map((value, i) => i === index ? { ...value, altText: e.target.value } : value) })} /><Button variant="ghost" onClick={() => setCollection({ ...collection, images: collection.images.filter((_, i) => i !== index) })}><Trash2 className="size-4" /></Button></div>)}</div></div>
          <div><Label>Collection pieces</Label><p className="mt-1 text-xs text-ink/45">Choose “entire item” or hand-pick only the colors/options that belong.</p><div className="mt-4 max-h-[600px] space-y-3 overflow-y-auto">{items.map((source) => { const all = collection.members.some((member) => member.productId === source.id && member.variantId === null); return <div key={source.id} className="rounded-xl border border-ink/10 p-4"><label className="flex items-center gap-3 font-display text-lg"><input type="checkbox" checked={all} onChange={() => toggleMember(source.id, null)} /> {source.public_name} <span className="font-body text-xs text-ink/45">Entire item</span></label>{!all ? <div className="mt-3 grid gap-2 sm:grid-cols-2">{source.catalog_variants.map((variant) => <label key={variant.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={collection.members.some((member) => member.variantId === variant.id)} onChange={() => toggleMember(source.id, variant.id)} /> {variant.label}</label>)}</div> : null}</div>; })}</div></div>
          <div className="flex justify-between border-t border-ink/10 pt-5">{collection.id ? <Button variant="ghost" className="text-destructive" onClick={() => remove("collections", collection.id!)}><Trash2 className="size-4" /> Delete collection</Button> : <span />}<Button disabled={busy} onClick={saveCollection} className="bg-fig"><Save className="size-4" /> Save collection</Button></div>
        </div>
      </div>}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div><Label>{label}</Label><div className="mt-2">{children}</div></div>; }
function PhotoField({ label, path, busy, onFile }: { label: string; path: string; busy: boolean; onFile: (file: File) => void }) { return <div className="rounded-xl border border-ink/10 p-4"><Label>{label}</Label><div className="mt-3 flex flex-wrap items-center gap-3">{path ? <Image src={path} alt="" width={112} height={80} className="h-20 w-28 rounded-lg bg-secondary object-cover" /> : null}<label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-xs"><ImagePlus className="size-4" /> {path ? "Replace photo" : "Upload photo"}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={busy} className="sr-only" onChange={(e) => { const file = e.target.files?.[0]; if (file) onFile(file); }} /></label></div></div>; }
