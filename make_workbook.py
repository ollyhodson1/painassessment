import json, pathlib
from artifact_tool import Workbook, SpreadsheetFile
p=pathlib.Path(__file__).parent
cfg=json.loads((p/'public/content.json').read_text())
wb=Workbook.create()
for key, data in cfg.items():
    sh=wb.worksheets.add(key)
    sh.get_range_by_indexes(0,0,len(data),len(data[0])).values = data
    sh.freeze_panes.freeze_rows(1)
    hd=sh.get_range_by_indexes(0,0,1,len(data[0]))
    hd.format={'fill':'#075F63','font':{'bold':True,'color':'#FFFFFF'},'row_height':28,'vertical_alignment':'center'}
    sh.get_range_by_indexes(1,0,max(1,len(data)-1),len(data[0])).format.wrap_text=True
    sh.get_range_by_indexes(1,0,max(1,len(data)-1),len(data[0])).format.row_height=42
    for i in range(len(data[0])):
        sh.get_range_by_indexes(0,i,len(data),1).format.column_width = 28 if i==0 else 36
    if key=='settings':
        sh.get_range('A1:A30').format.column_width=30
        sh.get_range('B1:B30').format.column_width=65
        sh.get_range('C1:C30').format.column_width=45
    if key=='dialogue':
        sh.get_range('C1:C30').format.column_width=58
        sh.get_range('D1:D30').format.column_width=67
    if key=='actions':
        sh.get_range('C1:C12').format.column_width=70
        sh.get_range('D1:E12').format.column_width=60
    if key=='sbar':
        sh.get_range('C1:C12').format.column_width=85
    if key=='reflection':
        sh.get_range('B1:B12').format.column_width=86
out=p.parent/'SPL9_Pain_Assessment_Content_Bank.xlsx'
SpreadsheetFile.export_xlsx(wb).save(str(out))
print(wb.inspect({'kind':'sheet','include':'id,name'}).ndjson[:1800]); print(out)
