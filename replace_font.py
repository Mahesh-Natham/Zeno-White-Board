import os, re
path = 'src/components/canvas/elements/TimelineElement.jsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()
c = re.sub(r'fontFamily="Inter"', 'fontFamily=\'"Arial Rounded MT Bold", "Helvetica Rounded", Arial, sans-serif\'', c)
c = re.sub(r'fontFamily: \'Inter\'', 'fontFamily: \'"Arial Rounded MT Bold", "Helvetica Rounded", Arial, sans-serif\'', c)
with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
