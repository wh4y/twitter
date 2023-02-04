interface SortableByCreatedAtRecord {
  createdAt: Date;
}

export const sortRecordsByCreatedAtDesc = <Record extends SortableByCreatedAtRecord>(records: Record[]) => {
  return [...records].sort((firstRecord, secondRecord) => secondRecord.createdAt.getTime() - firstRecord.createdAt.getTime());
};
