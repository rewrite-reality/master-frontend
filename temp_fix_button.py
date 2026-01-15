from pathlib import Path

path = Path('src/components/profile/ProfileSetupClient.tsx')
text = path.read_text(encoding='utf-8')
start = text.index('\t\t\ttext={submitting')
end = text.index('\t\t\t/>', start) + len('\t\t\t/>')
new_block = '''\t\t<button
\t\t\ttype=" button\
\t\t\tclassName=\btn btn-primary w-full\
\t\t\tonClick={handleSubmit}
\t\t\tdisabled={!isValid || submitting || loading}
\t\t>
\t\t\t{submitting ? 'گِگ?‘:‘?گّگ?‘?گçگ?¢?³' : 'گِگ?‘:‘?گّگ?گٌ‘'‘?'}
\t\t</button>
'''
text = text[:start] + new_block + text[end:]
path.write_text(text, encoding='utf-8')
