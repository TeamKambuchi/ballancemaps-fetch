const username = "ballancemaps";
const indexLink = `http://cc.ysepan.com/f_ht/ajcx/ml.aspx?cz=ml_dq&_dlmc=${username}&_dlmm=`,
      fileListLink = `http://cc.ysepan.com/f_ht/ajcx/wj.aspx?cz=dq&jsq=0&mlbh={index}&wjpx=1&_dlmc=${username}&_dlmm=`;

async function getGroupIndexes(patternString) {
  const htmlString = await getYsHtml(indexLink),
        groupPattern = new RegExp(patternString);
  let indexes = [];
  Array.from(
    htmlString.matchAll(new RegExp('<li[^<>]+id="ml_([0-9]+)"[^<>]*>.*?<a [^<>]*>([^<>]+)</a><label>([^<>]+)?</label>.*?</li>', "g"))
  ).forEach(matches => {
    if (groupPattern.test(matches[2]))
      indexes.push({
        id: matches[1], 
        name: matches[2],
        notes: (matches[3] == undefined) ? '' : matches[3]
      });
  });
  return indexes;
};

async function getMapList(index) {
  const htmlString = await getYsHtml(fileListLink.replace("{index}", index));
  return Array.from(
    htmlString.matchAll(/<li(?:[^<>]+)>.*?<a[^<>]+?href="([^">]+)"(?:[^<>]+)?>([^<>]+)<\/a><i>([^<]+)<\/i><b>\s*([^\s|<>]+(?:\s+[^\s|<>]+)*)?\s*\|?\s*([^\s|<>]+(?:\s+[^\s|<>]+)*)?\s*\|?\s*([^\s|<>]+(?:\s+[^\s|<>]+)*)?\s*<\/b><span(?:[^<>]+)>([^<>]+)<\/span>.*?<\/a><\/li>/g)
  ).map(matches => {
    return {
      name: matches[2],
      url: matches[1],
      size: matches[3],
      author: (matches[4] == undefined) ? '' : matches[4],
      difficulty: difficultyToNumber(matches[5]),
      notes: (matches[6] == undefined) ? '' : matches[6],
      uploadTime: matches[7]
    }
  });

  function difficultyToNumber(difficulty) {
    switch (difficulty) {
      case '★': return 1;
      case '★★': return 2;
      case '★★★': return 3;
      case '★★★★': return 4;
      case '★★★★★': return 5;
    };
    return -1;
  };
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