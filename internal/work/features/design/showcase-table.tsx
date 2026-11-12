import { Section } from '@/ui/page'
import { Table, type TableConfig } from '@/ui/table'
import { Tag } from '@/ui/table-cells'

interface MemberRow {
  name: string
  hacks: number
  status: 'Active' | 'Invited'
}

const memberTable: TableConfig<MemberRow> = {
  ariaLabel: 'Sample members',
  rows: [
    { name: 'Ada Park', hacks: 6, status: 'Active' },
    { name: 'Sam Okafor', hacks: 3, status: 'Active' },
    { name: 'Lena Novak', hacks: 0, status: 'Invited' },
  ],
  rowId: (row) => row.name,
  mark: () => null,
  label: (row) => row.name,
  searchText: (row) => `${row.name} ${row.status}`,
  columns: [
    {
      id: 'hacks',
      label: 'Hackathons',
      width: 120,
      tier: 0,
      dock: 'none',
      align: 'end',
      render: (row) => String(row.hacks),
      sortValue: (row) => row.hacks,
    },
    {
      id: 'status',
      label: 'Status',
      width: 110,
      tier: 0,
      dock: 'none',
      render: (row) => (
        <Tag label={row.status} tone={row.status === 'Active' ? 'success' : 'neutral'} />
      ),
    },
  ],
}

export function ShowcaseTable() {
  return (
    <Section heading="Table" caption="Adaptive columns, sorting and keyboard selection">
      <Table config={memberTable} />
    </Section>
  )
}
