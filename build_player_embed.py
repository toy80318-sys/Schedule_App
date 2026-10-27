"""Keep the editor's embedded game on the same runtime as the standalone player."""
import argparse
import re
from pathlib import Path

WEB = Path(__file__).resolve().parent / 'docs'


def embedded_source():
    text = (WEB / 'player.html').read_text(encoding='utf-8')
    text = re.sub(r'<link[^>]+href="site-nav\.css[^\"]*"[^>]*>', '', text)
    text = re.sub(r'<script[^>]+src="site-nav\.js[^\"]*"[^>]*></script>', '', text)
    if text.count('<body>') != 1:
        raise ValueError('Expected one standalone player body')
    return text.replace('<body>', '<body data-jeju-embedded="true" class="embedded">', 1)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    expected = embedded_source()
    target = WEB / 'player-embed.txt'
    if args.check:
        if target.read_text(encoding='utf-8') != expected:
            raise ValueError('Embedded game is stale; run build_player_embed.py')
    else:
        target.write_text(expected, encoding='utf-8', newline='\n')
    print('PASS: editor game embeds the current player and helper scripts')
