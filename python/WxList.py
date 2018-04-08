# -*- coding: utf-8 -*-
# !/Library/Frameworks/Python.framework/Versions/3.5/bin/python3

from bs4 import BeautifulSoup
from urllib.request import urlopen
import re


def getText(base_url):
    content = urlopen(base_url)
    bsObj = BeautifulSoup(content, "lxml")
    i = 0
    record = False
    for dd in bsObj.findAll('dd'):
        for link in dd.findAll('a'):
            if 'href' in link.attrs:
                # if (re.search(r'\d+.html', link.attrs['href']) \
                #             and re.search(r'^[\d+_\d+.html]', link.attrs['href']) \
                #     ):
                    list = re.findall(r'\d+', link.get_text())
                    if link.get_text() == '第二十六章 审时度势 广源剑修':
                        record = True
                    if record:
                        print(link.get_text())
                        print(link.attrs['href'])
                        getContent("https://www.zwdu.com" + link.attrs['href'])
                        # i + 1
                # else:
                #     print("last")
                    # print("page->" + i)


def getContent(url):
    content = urlopen(url)
    bsObj = BeautifulSoup(content, "lxml")
    title = str(bsObj.title.get_text())
    tfile = open("dadaozhengfeng.txt", 'a')
    tfile.write("\n\n\n" + str(bsObj.title.get_text()) + "\n")
    tfile.write(bsObj.find_all("div", {"id": "content"})[0].get_text())
    tfile.close()


getText("https://www.zwdu.com/book/8017/")
