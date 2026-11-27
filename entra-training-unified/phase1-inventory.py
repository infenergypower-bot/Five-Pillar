import pathlib, json, subprocess, concurrent.futures, re, csv, collections, os, gzip, shutil, hashlib
root=pathlib.Path.home()/'Documents'/'IdentityAcademy-Phase1'
base=root/'entra-training-unified'
screen=json.loads((base/'qualification-screen.json').read_text(encoding='utf-8-sig'))
cache=pathlib.Path.home()/'Documents'/'IdentityAcademy-upstream-cache'
cache.mkdir(exist_ok=True)
old={(screen['repos'][r[0]],r[1]):r for r in screen['rows']}
def git(p,*args):
    return subprocess.run(['git','-C',str(p),*args],capture_output=True,encoding='utf-8',errors='replace',timeout=90,check=True).stdout
def inventory(item):
    repo,pin=item
    path=cache/repo.replace('/','__')
    path.mkdir(exist_ok=True)
    try:
        if not (path/'HEAD').exists():
            git(path,'init','--bare')
        git(path,'fetch','--depth=1','--filter=blob:none','https://github.com/'+repo+'.git',pin)
        raw=git(path,'-c','core.quotepath=false','ls-tree','-r','--full-tree',pin)
        rows=[]
        for line in raw.splitlines():
            meta,name=line.split('\t',1)
            mode,kind,sha=meta.split()
            prior=old.get((repo,name))
            if kind!='blob': state='unresolved-submodule'
            elif re.match(r'^\.github/(ISSUE_TEMPLATE|PULL_REQUEST_TEMPLATE|workflows|dependabot)',name,re.I): state='excluded-repository-maintenance'
            elif re.search(r'(^|/)(LICENSE(?:\.[^/]+)?|NOTICE|CODE_OF_CONDUCT\.md|SECURITY\.md|CONTRIBUTING\.md)$',name,re.I): state='reference-license-or-policy'
            elif prior: state='previously-screened-unresolved' if prior[4] is None else 'previous-screen-record-check'
            elif re.search(r'(entra|identity|authenticat|authoriz|conditional.access|access.review|entitlement|privileged|pim|federat|kerberos|oauth|openid|saml|scim|token|service.principal|managed.identit|directory|sign.in|password|mfa|passkey|tenant|permission|app.registration|agent.id|hybrid|external.identit|b2b|zero.trust)',name,re.I): state='priority-candidate-unreviewed'
            else: state='unresolved-relevance'
            rows.append((repo,pin,name,sha,state))
        print(repo,len(rows),flush=True)
        return rows,None
    except Exception as e:
        print(repo,'ERROR',str(e)[:300],flush=True);return [],[repo,pin,str(e)[:300]]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
    results=list(ex.map(inventory,screen['pins'].items()))
rows=[r for rs,e in results for r in rs]
errors=[e for rs,e in results if e]
out=base/'phase1-full-inventory.tsv'
with out.open('w',encoding='utf-8',newline='') as f:
    w=csv.writer(f,delimiter='\t',lineterminator='\n');w.writerow(['repository','pin','path','blob_sha','screen_state']);w.writerows(rows)
stats={'method':'Pinned git ls-tree, not content qualification; only explicit maintenance paths excluded. All unreviewed content remains unresolved.','total':len(rows),'states':dict(collections.Counter(r[4] for r in rows)),'repositories':dict(collections.Counter(r[0] for r in rows)),'errors':errors,'prior_screen_rows':len(old),'prior_screen_matched':sum((r[0],r[2]) in old for r in rows)}
with out.open('rb') as src, (base/'phase1-full-inventory.tsv.gz').open('wb') as dst:
    with gzip.GzipFile(filename='',fileobj=dst,mode='wb',mtime=0) as compressed: shutil.copyfileobj(src,compressed)
stats['inventory_sha256']=hashlib.sha256(out.read_bytes()).hexdigest()
stats['compressed_file']='phase1-full-inventory.tsv.gz'
stats['verified_count']=sum(1 for _ in gzip.open(base/stats['compressed_file'],'rt',encoding='utf-8'))-1
assert stats['verified_count']==stats['total']
(base/'phase1-inventory-summary.json').write_text(json.dumps(stats,indent=2),encoding='utf-8')
print(json.dumps(stats),flush=True)
