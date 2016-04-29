# OpenSeadragonizer_mod

[OpenSeadragonizer]改造版（連番画像向け）

[早稲田大学古典籍総合データベース]の簡易ビューワにも（ページ移動可能がミソ）。

[OpenSeadragonizer]: http://openseadragon.github.io/openseadragonizer/
[早稲田大学古典籍総合データベース]: http://www.wul.waseda.ac.jp/kotenseki/

## 使い方

表示したい画像のURLと総コマ数を入力してください。

例えば、古活字版（嵯峨本）『[伊勢物語]』を表示したい場合、index.htmlを開いて、次のように入力します。

[伊勢物語]: http://www.wul.waseda.ac.jp/kotenseki/html/he12/he12_04353/index.html

- 画像のURL：http://archive.wul.waseda.ac.jp/kosho/he12/he12_04353/he12_04353_p0001.jpg
- 総コマ数：121

入力後に表示される次のURLをTwitter等で利用すれば、閲覧した方は[OpenSeadragon]の機能を用いて拡大縮小やページ移動することができます。

- http://2sc1815j.github.io/openseadragonizer_mod/?img=http://archive.wul.waseda.ac.jp/kosho/he12/he12_04353/he12_04353_p0001.jpg&pages=121

[OpenSeadragon]: https://openseadragon.github.io/

また、ビューワ上で任意の矩形領域を選択し、ハイライト表示することができます。このときのURLをTwitter等で利用すれば、閲覧した方に注目箇所を伝えることができます。

- 古活字版（嵯峨本）『伊勢物語』に写り込んだインテルをハイライトする例
  - http://2sc1815j.github.io/openseadragonizer_mod/?img=http://archive.wul.waseda.ac.jp/kosho/he12/he12_04353/he12_04353_p0073.jpg&pages=121#xywh=percent:17.5,9,2.5,4.5

画像のURLには、IIIFやDZI等のJSON/XMLファイルも指定可能です。

- プリンストン大学デジタルライブラリの『[平家物語]』の書き間違い？をハイライトする例（IIIF info.jsonを指定）
  - http://2sc1815j.github.io/openseadragonizer_mod/?img=http://libimages.princeton.edu/loris/pudl0071/4055459/01/00000008.jp2/info.json&pages=473#xywh=percent:58.6,19,7,7.5

[平家物語]: http://arks.princeton.edu/ark:/88435/5d86p097k

### キーボードショートカット (keyboard shortcuts)

- [ n, >, . ] - 次のコマへ移動 (next page)
- [ p, <, , ] - 前のコマへ移動 (previous page)
- [ c ] - 領域選択モード切り替え (toggle selection mode)
- [ f ] - フルスクリーン切り替え (toggle full page)
- [ u ] - 現在のコマのURLを表示 (show the URL of the current image)
