import os
import re

def resolve_conflicts(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.js') or file.endswith('.jsx'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                if '<<<<<<< HEAD' in content:
                    print(f'Resolving conflicts in {filepath}')
                    # Regex explanation:
                    # <<<<<<< HEAD\n (start marker)
                    # (.*?) (capture HEAD content)
                    # =======\n (separator marker)
                    # .*? (other branch content)
                    # >>>>>>> .*?\n (end marker)
                    # re.DOTALL makes . match newlines
                    new_content = re.sub(
                        r'<<<<<<< HEAD\r?\n(.*?)\r?\n=======\r?\n.*?\r?\n>>>>>>> [^\r\n]*\r?\n?',
                        r'\1\n',
                        content,
                        flags=re.DOTALL
                    )
                    
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)

resolve_conflicts('src')
print('Done resolving conflicts.')
