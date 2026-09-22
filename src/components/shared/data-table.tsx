"use client"

import { useState, type ReactNode } from "react"
import {
  createSortedRowModel,
  flexRender,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import { cn } from "@/lib/utils"

/** Registro compartido de features de tanstack/react-table v9 — estable a nivel de
 * módulo, usado por todas las tablas de la maqueta (ordenamiento + selección). */
export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  rowSelectionFeature,
  sortedRowModel: createSortedRowModel(),
})

/**
 * `TData` is intentionally unconstrained here so callers can pass plain domain
 * `interface`s (Order, Product…) — TanStack v9's own `RowData` bound
 * (`Record<string, any> | Array<any>`) only structurally accepts object type
 * aliases, not named interfaces. The `Record<string, unknown>` cast happens
 * once, internally, when the table instance is constructed below.
 */
export type DataTableColumnDef<TData> = ColumnDef<typeof dataTableFeatures, TData & Record<string, unknown>, unknown>

interface DataTablePagination {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
}

export function DataTable<TData>({
  columns,
  data,
  isLoading,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar…",
  filters,
  toolbarEnd,
  emptyState,
  enableRowSelection,
  rowSelection,
  onRowSelectionChange,
  getRowId,
  pagination,
  className,
}: {
  columns: DataTableColumnDef<TData>[]
  data: TData[]
  isLoading?: boolean
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  filters?: ReactNode
  toolbarEnd?: ReactNode
  emptyState?: ReactNode
  enableRowSelection?: boolean
  rowSelection?: RowSelectionState
  onRowSelectionChange?: (selection: RowSelectionState) => void
  getRowId?: (row: TData) => string
  pagination?: DataTablePagination
  className?: string
}) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [internalSelection, setInternalSelection] = useState<RowSelectionState>({})
  const selection = rowSelection ?? internalSelection
  const setSelection = onRowSelectionChange ?? setInternalSelection

  const tableColumns = enableRowSelection
    ? [selectionColumn<TData>(), ...columns]
    : columns

  const table = useTable({
    features: dataTableFeatures,
    data: data as (TData & Record<string, unknown>)[],
    columns: tableColumns,
    state: { sorting, rowSelection: selection },
    onSortingChange: setSorting,
    onRowSelectionChange: (updater) => {
      setSelection(typeof updater === "function" ? updater(selection) : updater)
    },
    getRowId: getRowId as ((row: TData & Record<string, unknown>) => string) | undefined,
    enableRowSelection,
  })

  const showToolbar = onSearchChange !== undefined || filters || toolbarEnd
  const rows = table.getRowModel().rows
  const showEmpty = !isLoading && rows.length === 0

  return (
    <div className={cn("space-y-3", className)}>
      {showToolbar ? (
        <div className="flex flex-wrap items-center gap-2">
          {onSearchChange ? (
            <InputGroup className="w-full max-w-xs">
              <InputGroupAddon>
                <Search className="size-4" strokeWidth={1.75} />
              </InputGroupAddon>
              <InputGroupInput
                placeholder={searchPlaceholder}
                value={searchValue ?? ""}
                onChange={(e) => onSearchChange(e.target.value)}
                aria-label={searchPlaceholder}
              />
            </InputGroup>
          ) : null}
          {filters}
          <div className="ml-auto flex items-center gap-2">{toolbarEnd}</div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="h-14">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sortDir = header.column.getIsSorted()
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 hover:text-foreground"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortDir === "asc" ? (
                            <ArrowUp className="size-3.5" strokeWidth={1.75} />
                          ) : sortDir === "desc" ? (
                            <ArrowDown className="size-3.5" strokeWidth={1.75} />
                          ) : (
                            <ArrowUpDown className="size-3.5 opacity-40" strokeWidth={1.75} />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="h-14">
                  {tableColumns.map((_col, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full max-w-32" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : showEmpty ? (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="p-0">
                  {emptyState}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className="h-14"
                >
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination ? <DataTablePaginationBar pagination={pagination} /> : null}
    </div>
  )
}

function selectionColumn<TData>(): DataTableColumnDef<TData> {
  return {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todo"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    ),
    enableSorting: false,
  }
}

function DataTablePaginationBar({ pagination }: { pagination: DataTablePagination }) {
  const { page, pageSize, total, onPageChange, onPageSizeChange, pageSizeOptions } = pagination
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <p>
        {total === 0 ? "Sin resultados" : `${from}–${to} de ${total}`}
      </p>
      <div className="flex items-center gap-3">
        {onPageSizeChange ? (
          <div className="flex items-center gap-2">
            <span>Filas por página</span>
            <NativeSelect
              size="sm"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="w-16"
            >
              {(pageSizeOptions ?? [10, 20, 50]).map((size) => (
                <NativeSelectOption key={size} value={size}>
                  {size}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        ) : null}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Página anterior"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="size-4" strokeWidth={1.75} />
          </Button>
          <span className="px-2 tabular-nums">
            {page} / {pageCount}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Página siguiente"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="size-4" strokeWidth={1.75} />
          </Button>
        </div>
      </div>
    </div>
  )
}
