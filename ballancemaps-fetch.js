const username = "ballancemaps", groupKeyword = new RegExp("Ballance自制地图");
const indexLink = `http://cc.ysepan.com/f_ht/ajcx/ml.aspx?cz=ml_dq&_dlmc=${username}&_dlmm=`,
      fileListLink = `http://cc.ysepan.com/f_ht/ajcx/wj.aspx?cz=dq&jsq=0&mlbh={index}&wjpx=1&_dlmc=${username}&_dlmm=`;

async function getGroupIndexes() {
  const parser = new DOMParser(),
        htmlString = await getYsHtml(indexLink);
  if (htmlString == null) return;
  let indexHtml = parser.parseFromString(htmlString, "text/html"),
      indexes = [];
  indexHtml.querySelectorAll("li.gml").forEach(element => {
    let indexName = element.querySelector("a.ml").innerHTML;
    if (groupKeyword.test(indexName))
      indexes.push({id: element.id.replace("ml_", ""), name: indexName});
  });
  return indexes;
};

async function getMapList(index) {
  const htmlString = await getYsHtml(fileListLink.replace("{index}", index));
  return Array.from(htmlString.matchAll(/<li(?:[^<>]+)>.*?<a href="([^">]+)"(?:[^<>]+)?>([^<>]+)<\/a><i>([^<]+)<\/i><b>\s*([^\s|<>]+(?:\s+[^\s|<>]+)*)?\s*\|?\s*([^\s|<>]+(?:\s+[^\s|<>]+)*)?\s*\|?\s*([^\s|<>]+(?:\s+[^\s|<>]+)*)?\s*<\/b><span(?:[^<>]+)>([^<>]+)<\/span>.*?<\/a><\/li>/g));
};

async function getYsHtml(url) {
  let responseString = await fetch(url, {
    method: 'GET',
    referrer: 'http://cg.ys168.com/f_ht/ajcx/000ht.html?bbh=1134',
  })
  .then(response => response.text())
  .then(text => text.substring(text.indexOf("<")))
  .catch((error) => {
    console.error('Error: ', error);
  });
  return responseString;
};