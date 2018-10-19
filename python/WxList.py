# -*- coding: utf-8 -*-
# !/Library/Frameworks/Python.framework/Versions/3.5/bin/python3

from bs4 import BeautifulSoup
from urllib.request import urlopen
import re


def getText(base_url, til_url):
    content = urlopen(base_url + til_url)
    bsObj = BeautifulSoup(content, "lxml")
    i = 0
    record = False
    for dd in bsObj.findAll('dd'):
        for link in dd.findAll('a'):
            if 'href' in link.attrs:
                if link.get_text() == '第一百四十七章 大难不死必有后福':
                    record = True
                else:
                    print("skip->" + link.get_text())

                if record:
                    print("output->" + link.get_text())
                    print(link.attrs['href'])
                    getContent(base_url + link.attrs['href'])
                    i + 1


def getContent(url):
    content = urlopen(url)
    bsObj = BeautifulSoup(content, "lxml")
    title = str(bsObj.title.get_text())
    tfile = open("./" + title.split("_")[1] + ".txt", 'a')
    tfile.write("\n\n\n" + str(bsObj.title.get_text()) + "\n")
    tfile.write(bsObj.find_all("div", {"id": "content"})[0].get_text())
    tfile.close()


getText("https://www.biquge.com.tw", "/6_6967/")
