import { TableSkeleton } from "@/components/customers/table-skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <TableSkeleton />
    </div>
  )
}