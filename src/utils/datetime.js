function prefixInteger(num, n) {
  return (Array(n).join(0) + num).slice(-n);
}

function formatTime(time) {
  let datetime = new Date(time);
  let hour = prefixInteger(datetime.getHours(), 2);
  let minute = prefixInteger(datetime.getMinutes(), 2);
  let second = prefixInteger(datetime.getSeconds(), 2);
  return formatDate(time) + " " + hour + ":" + minute + ":" + second + "";
}

function formatDate(time) {
  let datetime = new Date(time);
  let year = datetime.getFullYear();
  let month = prefixInteger(datetime.getMonth() + 1, 2);
  let date = prefixInteger(datetime.getDate(), 2);
  return year + "-" + month + "-" + date;
}

function human(dtstr) {
  let dt = new Date(dtstr);
  let dateTimeStamp = dt.getTime();
  let minute = 1000 * 60;
  let hour = minute * 60;
  let day = hour * 24;
  let month = day * 30;
  let now = new Date().getTime();
  let diffValue = now - dateTimeStamp;
  if (diffValue < 0) {
    return;
  }
  let monthC = diffValue / month;
  let weekC = diffValue / (7 * day);
  let dayC = diffValue / day;
  let hourC = diffValue / hour;
  let minC = diffValue / minute;
  let result;
  if (monthC > 12) {
    let y = dt.getFullYear() + ' 年';
    let m = dt.getMonth() + 1 + ' 月';
    let d = dt.getDate() + ' 日';
    result = [y,m,d].join(' ');
  } else if (monthC >= 1) {
    result = "" + Math.floor(monthC) + " 个月前";
  } else if (weekC >= 1) {
    result = "" + Math.floor(weekC) + " 周前";
  } else if (dayC >= 1) {
    result = "" + Math.floor(dayC) + " 天前";
  } else if (hourC >= 1) {
    result = "" + Math.floor(hourC) + " 小时前";
  } else if (minC >= 1) {
    result = "" + Math.floor(minC) + " 分钟前";
  } else result = "刚刚";
  return result;
}

export {formatTime, formatDate, human}
