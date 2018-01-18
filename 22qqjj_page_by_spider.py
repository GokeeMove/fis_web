from talospider import AttrField, Item, Request, Spider, TextField
from talospider.utils import get_random_user_agent
from pprint import pprint

class DoubanItem(Item):
    """
    定义继承自item的Item类
    """
    target_item = TextField(css_select='td.listtitletxt')
    title = TextField(css_select='a._blank')

    def tal_title(self, title):
        if isinstance(title, str):
            return title
        else:
            return ''.join([i.text.strip().replace('\xa0', '') for i in title])

if __name__ == '__main__':
    items_data = DoubanItem.get_items(url='http://www.22qqjj.com/html/part/28.html')
    result = []
    for item in items_data:
        result.append({
            'title': item.title,
        })
    pprint(result) 
