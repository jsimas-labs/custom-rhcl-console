import { Table } from '../Table';
import { Thead } from '../Thead';
import { Tbody } from '../Tbody';
import { Tr } from '../Tr';
import { Th } from '../Th';
import { Td } from '../Td';
// Table Defaults
export const TableDefaults = {
    renderers: {
        table: Table,
        header: {
            wrapper: Thead,
            row: Tr,
            cell: Th
        },
        body: {
            wrapper: Tbody,
            row: Tr,
            cell: Td
        }
    }
};
//# sourceMappingURL=types.js.map