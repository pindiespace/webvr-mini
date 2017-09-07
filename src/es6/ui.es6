'use strict'

class Ui {

    /** 
     * DOM, fullscreen, and stereo Ui.
     */

    constructor ( init = false, util, webgl, webvr ) {

        console.log( 'in Ui' );

        this.UI_DOM = 'uidom',

        this.UI_VR = 'uivr',

        this.UI_FULLSCREEN = 'fullscreen';

        this.mode = this.UI_DOM; // by default

        /* 
         * some icons were modified from the noun project.
         * @link https://thenounproject.com/
         * Conversion of SVG to base64
         * @link http://b64.io/
         */
        this.icons = {

            // Created by Cyril S of the Noun Project.

            vr: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABkCAMAAAB5NchtAAAAYFBMVEUAAAAAAAD//wCAgAD//wDAwAD//wBAQAD//wDw8AD//wD//wD//wD//wCgoAAgIADg4AD//wBgYAD//wBwcAAwMAD//wDQ0ACQkABQUAD//wD//wD//wCwsAD//wD//wCnD3VfAAAAIHRSTlMAq6urVquBqyuroRULa6urq0Cri6urlqurq0s2IKt2YQWtHu0AAANCSURBVHgB7Zlpl7osAEfxqhW477Z//2/5NNMZjcIy9WnO/A/3bQn3sMAPEH8Ei8VisVgsFsumZ++9Iuv+G0yvMPO8aHVBMRt1KebsZe/IeIrl4TRaYc8Dqd/jvuLo/4BGNLoBIP2qZn3BmU9yKcZ1G6jFSE6QO4sDiJGsYO0sTgMbMQ4gcRbHf0vAWZ4Ydr8q4IInRrGB9LcF/H9RYAurXxVY/x2BHRwdjTxuAOm31Zimbn2AJs6nCnjgahNY0pG+WqPzlA7pLiGQSzT8xBmmatCQ29kCMUB93oRCBFkEII390MuqaB8IEW7OCqCcKRADKhM/BNEzgy3AOewHkwLcWQIlUIRaWFEgB9pfgtL2m6AAul4A3hVI+vo7DmpoljagDkIjLEDOEPChDsUdGea4kGPYb0MF8WSBCuMWfjI3QQpnIUy6yVSB1jxsAmNgqYBQPFJDOVUghUwYKK5l6rQQDayr/lQBIBy3Vl/wB2wDYKLAGorxu5WEgzAxS2A1XgAYzth/T6Cc1AXBcMh/V2Br+OL1INwvPAiddKDM0zvTMJsxDWNzmQFQmbZCFZqGwIyFaI1xakXQmJdizzheSOZsRoXx9sAUzFyTblhP3Yy6JojE2O04hSJ87ACZdJtF/XYgaYEovK9fJkO5m0Jrg3AFlLMi2REoNn2JHn3GMSYCtRMdmxqIlwilq+sV1zVnym4AJG0DpG1ya0DtHcSFYFcAxLNjucuVQvFNWt39ogVPyTd1zTeyXOBgUvkYzxoxPU3vK+mJE2e+wIXEvTqkx9zR6q+zr2lZaAZOfrw6+GUy92imsdaLK2/mRwTEej7rU+t8ATPytrjIMDX+Z4FYX/lXkC53QbEfcT+AngADBe4nr2hKqO9bTX5SoIHdwwko/5xAwkP+OoP/OYESijHHJY12tEDwsj9Tw61rYRyGhtA4/6rWfAzcQfqpy+oWTuKeEFgvJKCgerEKZsaoGL/4KljmwWILyjx2WejFJIL2+TIcCQP106WgMmsb8W4eytyecn0FOAx81qxvKG8e0RqAkxhJwAvqaZ9lYiybSPEMTxg5Pbf2QvEWh82FzOuJVj8Ewsh+pRHdPiULi8VisVgsFotliP8AcnQzhVuzTBwAAAAASUVORK5CYII=',

            htcvive: 'data:image/png;base64,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',

            oculusrift: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABkCAMAAAB5NchtAAAAYFBMVEUAAAAAAAD//wBAQAD//wDAwACAgAD//wD//wCgoADx8QAgIAD//wDQ0AFgYAD//wDg4AD//wD//wD//wBwcAD//wCQjwD//wAwMAD//wCwsAD//wBQUAD//wD//wD//wALJkCDAAAAIHRSTlMAq6urgaurVqGrq6trq6sLqysgi6uWq0CrNqt2qxVhSxMoBJ0AAANiSURBVHgB7dnbjrJIFMXxXX8OlpwFEcSD7/+WE3cQpycTKbGmnS/hd8WFbZabWgWVltVqtfqTXTIL6lTLF9SWp05+X8sTtpTfdgTORgUJ3OS3bWBrRnvIvhEgNqMAwjXAV9ZAMNp/KcDT9wMkXwlQRaN8bcEaYA2wBlgDrAH+ywDlcXMK/0X782Fkw3/YdBfxoM5YrulK+UyZ8RnbeTj7VNt98L4izrkLPxhCBxAFZqk0TgBbf/L7k735yPAjQb2r52+6xW5KvbSQ9OZDxfPcWDdAu5OXGu6a+2UG9Mb4SBA+ftDsHbk9D9sXQOfvI0E3fnfCzCEyhCrI4aQDiIwXA7QicoLBbCGcCXA2gf6BvV96kSY6ggaC2T070/0dkB1UxpODjhTQc/xp/sxfwU6vPEmBsoZEs2zkhR3ketNuOgtP9BcddU1FcJQXSp1TDFkIgfFlC5sNHIxJoJZX2sdK8Roghs1JWw3ISyEUes+8BiggfJSgkZemQTUeA+hI50ugxqXiP0AzXwI1laX1HmC+BApITQHWc4D2cW8v8pouvh7wHMDCXle3qPnN2H+A+SeBusFgTO49wLTDyWvjQ2jrP8D4tRuZM0b1HmAswU7U7GbsP8C4tC4yZ9yz/QcoXEowbcaV7wCuJZg2Y78BHEugLuNnvQZwLYGy0Juz5wDuJRjfjHu/AVxLoK76Yb8BXEugOh1X4jNA4V6CaTOuYG98id1LMG3GAxx8vhUnziUYz1Ax5D7PBblzCcZXghRIjR/9VILyjf/JJv6ORlstQQ9W5k3nsxwSf0dDAnN2K8F0PjsAg/Eh4lGCq7jR97ctOrjP7QEq7dVN3JyALar3sAmp7QEtgZMjisTDDPZAnqCsuLqiofsELcRy6QAkaY46irPd1UJkNEESp2aZdAuQ9wHQNFkt76h1I0oj7vJDEbxrf8i5G7QGmbwtRB8G+4RPVGfdCNnJ27rHRlTkLBUV40YYygJ2qkBaxEOUQBs6aYA8GuKzUemyAWgVcjM5uK/i0kKVGvXBAOQC9H9fz7YUNxstcfocQCeLnB6bwDl6s8YZGiEYB9DKMkf0tSyuuGuP4q5ruYvOfa4DWKhhEnbvlijkoZWl6hZls4u8bxeibC2LlVcL4a2UZXbXhvZayv/barVa/QWitTau9tPhRAAAAABJRU5ErkJggg==',

            smartphone: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABkCAMAAAB5NchtAAAAYFBMVEUAAAAAAAD//wCAgABAQADw8AD//wD//wDAwAD//wCgoADQ0AAgIABgYAD//wBQUACQkAAwMAD//wDg4AD//wD//wD//wCwsAD//wD//wD//wD//wBwcAD//wD//wD//wBHb2y0AAAAIHRSTlMAq6urq6uBVqsLq6urq4urq6tAq5aha6thNiAVqytLdhOYuoMAAAOISURBVHgB7Zntcqs4DIZXDzYh2HwQyEfSpOf+73KXE0Gy080MBqfdM8PzszONXl7JSBZ/raysrKysROO2/dZo6Zc/bfabb5PwcYCvAqDbfVv4/xYA5e3t4bcbeC0A0o/3xj/v+ZeA3Wb3ENAC7N+ahxNAW4wCSqAcBSQ+Azi9L/slYAuRQcCOnt0oQMRYoPx4o/3OyyhA8755CPgHB+zPb4kPUEvPSwd66l7BJX78yx5sJb95VQPym8pCt41+/Dqwjdx5cQpUgDRAGltACRj5ImBABShF/LNwAAqZKkByLY1ofAK5TBcgLm4h3oBMRuoXApyXAR+3EEtwMlC1L3uBrWTA6AsiCjugeU4v5Vd7t78Ajl6UKxDrjdg9FUAG7D9fvyltIkoLhzjxN2D9o7hed9xtCtB6PYuRLLhsmEWb2QgWfGw6FrFsTtweWMySUfVzT8/xamQGpqodPd15yeO3hSzA1xbgsJ0TX6efpSQWKLfz4mcy0lRJEEYGvJuloHzuPia3BONqL3fyGQpOwFXuVI6ZZOpDETygnB/P7zP9sToJIFfRR+0LoZ2p0+6nYzZ5JcEUGdofNQuXoJc/Xs3TDjcHkzHOUQ7SIAMSjb/sKFZ2UGBCZrQdWOlprE7Cs2kcUGkSyqkCfg0V6DT+Epz2ch9QBUAzJMDIQhqrL7Tj5En9NmSgVSeWUeljFNBNHsGP+p9WIpCpBVMHpHHAz9WApRg91BlMa8wpFJqBSmLg7q/1GjZTBRi1TKJwvec0gVOIAAOtRMGAu9dUGiggkyiol+ZPE7AKWAWsAlYBDbTRBfxAM1IvQwScIInajmvI793wMHUgqRcPJMY91lUtFCHzwFmrr1qQA29BjRSjv5NNvRl8AIPyWuaR02OlJ1Mnp8/lHRTDWN7MH0QBnYcwd0O76Xfzo/S42SexHh1orBqQT1/aXYa7aQO4BTVQ6+1O9GZ0C1iP5OPl1PkFp6CPT6MGdEHLaTMWk61kLsl4P2/CvmCko/WJrlrmULWP273Ty3FAFeRPV3xc4SWM5toCtM3o5C1wQc5V6+k4LJ+TydSZpYd69kesVJPXY47MI/eP+OWcRWUuir9mhHIsRKln7AlVwfMRNFUyHdPIgM+A7jJ3WZz81K54XJfb2v/Atlw5d7r1rcx3fy9Qtpv9j30xUba7kgWUu2XhVcMp7QimS08afWVlZWVl5f/N39MRN8Py5nBMAAAAAElFTkSuQmCC',

            emulated: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABkCAMAAAB5NchtAAAALVBMVEUAAAD/c3P/c3P/c3P/c3P/c3P/c3P/c3P/c3P/c3P/c3P/c3P/c3P/c3P/c3MpA9IiAAAAD3RSTlMAq1aBK0RuoSCWC4thFTZMP6heAAABRUlEQVR4AezBgQAAAACAoP2pF6kCAAAAAAAA4PbKaFV2EIaiMZrEtjr//7mXWuy2DPdtYjngeigztJBFso2/pKYTeomsFi62Umk6u4YRnl7/CE90fv1XDTR8k2geKXSUEUWaR+z1P0SUbfhTmTVGZaGGcIkxFs70U+oz+zKkgPurVjK7HBJUDPVKJGYAAekfegiUcHHQRT8So0B8jIp9ImDxwtB2Dp0drXES+CY1AUTy86qAEumrAhvRNltAukBLZc7tp4eAIulPukB7irSn6x7435JOduq1RlUPgYyen1SWlJ8CiiQ4CCBdtuNqthghcPeoQMBlBiapbCh2C+y4Eg4HAbRgxHYI0HGfxegikMI3CS/2vg8KBJyGAGQwu3OaIOBsYDK2pg/JyE+AqhrKl/qYTV9WCgEXkvDJJ9NfYrFYLBaLxT9mCQfDsng1HAAAAABJRU5ErkJggg==',

            strikethrough: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABkCAMAAAB5NchtAAABEVBMVEUAAAD/AAD/AAD/AAD/AAD/OgD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AQD/AgD/AAD/AAD/AAD/AQD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AAD/AQD/AAD/BQD/AQD/AAD/AAD/AAD/AAD/AAD/AAD/AgD/AAD/AAD/AAD/AAD/AgD/AAD+AQD/AAD+AAD/AAD/AAD/PgD/HQD/DAD/AAD/AAD/AQD+AAD/AQD/AQD/7AD/AAD/qwD//wD/xAD+dAD/XQD+ngD+WQD+2AD/EAD/fgD+HwD+cgD+yQD/AgD/gAD/MQD+RQD//wD//wD//wD//wD/hAAqGgnhAAAAW3RSTlMAq620sAOvqBEKoraSgg68sp1ZJQaln3t2cV0wGRWGlYtWTD84HgjAmGxoQzQgG7iPZGFIOy4sKYgju7urmpRpT01KRjIJGQ25srGkoqCNfWpXU0EyHmExKygcO7Wd2wAAA/RJREFUeAHtmmd+4kgUxNVB3aCAkASSyAgYsgkYjPE4h/HkPBv2/gfZsOrW7gVqvvC/QP9e+XW5qJZx5MgRLGE9aBSMn0YxXPu2PE8Xxk+i4VIiCLHGtcHQwFO661bL5B8kOb/bG1jMQ+AwSv6FjvwZehVOaoSq8z2SDMDnV7axpebnNKrtTANK69TlgmSUo/qiYkApBD4V2fy23Z61DCy7JGLZ+ouyPO+b4PEHMbfV9nM5CYvY21e6dwRR62c7wQsDy4t6h7JsfCZXvRL49oXTqqfkpyKeo+UfuFp+uvQnDfTt/+pIpi4/idZNsPzNdDwS2fik3O2DzWe4rxENs5IBeP2KfTc3f+LXzgwshVl7yfL5U/D4ZmFD9fGcur2mgeUx8alaP2q1+2j554nM5xcTtPmaM4cr9xG2E5yA3Wex6UiuxpedtIU9v7i7udLyC687L8KTv5afetZ0Dz6/1OtW1fyMjDcn6OSdrhjV6+/0CiY4e9xIKlTyF/FjycDSb1e1+QsraRhYmr2uzXT0jOrNIdZ8mkEkqFo/1j5FJ/+zms/LmfzMcrfo3mEeU538KZmEFfD/3vvc/PmyUw8NLIf1FdXuI69vi+DoF06rIyU/oTE6eRe3efInbDw9A0ff1u1Kmz+X13Vw9jAXQcfjJMP7cAqW/+nHpxEjGfTyzcfv2PGfP1+8JJqX776B5f/y9oLkXL5+/2AgeXj/+pLkXLz9Av77f3v3X/kvPj9jz//+8c2ljj5s9OnHE/jvf/rB08nL6wQLdPSqX+vkz6qr2xa4dzibjnX0IcLdFsHyN2KqzX9UnYbg4r94ey3V/IxerQ/wJ5/Okiv5uXMPTv6VcJJ3/jaFtX6arWuxbP4yx9c+rdM20+svoqCJlX/YrEdcRx+7C699Gokl1PqxKrz2KT3GQrmvoPIGHb0KPUcnL8pWKfx3/2ZMmDb/LrrzL+6nlke1+7gN+A+/ridIBru62YHfHFrp/1q3zQK8fieBY4vc/Gcm+slpIriWXybzArz2sShVt99PHuG1j0vz+ekG3bqVUovp45ftWQFf+xBt/pbbR5eug8RiRFPbo6Kf+fDL739nn363rDv/0Tht4nqHXx/+MIzmOiJlffucr7jk/+q3V0+G2Zj4S5on/0EJt/7Pf50/nMci/9ykOg0r6M5/JRlVl79Th7/3B47NtfzOfQn85BNOJNfJn8for33M/rksiyz5syjZoZP/rG3bKvhTPwCPX1nUozLJENxFd/7mrhbR3PzjLfpjp0FCvLzzr53A3/v9EdXJ3wkO6Oy1vzsnMlv/aveuZOAZDmpjixBBKDz5aw5pW9r+Ov/YC0+hEaCffI4cOfInY2NXGby88ZgAAAAASUVORK5CYII=',

            viveControl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABkCAMAAAB5NchtAAAAY1BMVEUAAAAAAAD//wCAgADAwABAQADw8AD//wD//wAwMADQ0ACgoAD//wDg4ABgYACQkAD//wBwcAD//wD//wD//wD//wD//wBQUACwsAD//wAgIAD//wD//wD//wD//wBaVgD//wAiIyFbAAAAIXRSTlMAq6urq6urK1arq6uBq6ura6sLoUB2Fauri6sgYTZLq5YNLwn5AAADR0lEQVR4Ae3aW5OiOheA4aw3B0gwHEDxYGv3//+V3yfVTkMpe99I2FPtczUXqcrLlNRadqne/mJ9ds03uzy/ZGeVXLvdMdLttq1K6H77xO7ap7r+CwbmoMtGV8a4e0OKhOzITay82L2+aaz3VeSmyxe/fgPgKlseIiOhapoA8JWpJX1wU3weeBT1ZwSo1XKuAMbfrw+m0v93MI6B+9TLFmyBYH0ECNrKj1NZOIDiFIB6yftFAmCsPNAOaOQA1Eve3wzXPBXAiRQLFWyBKCIGtMyIYJcqOAPODwHsZYYBK8sUnLvv+6WAIM+VwP0Mx3aZ+8UCwcsTGjAiSxTc7x9UAIe9TJ2ayHBoiYK+A/zkScEdtPUysGUVuIk/hwpgp16kBkr5YQ3POC0jBdCql+gn9w9s4ZgiNDIV4PqyCWTkgW8K4+4zQe9Pzz6TuXqJHAr5puXflK8PyCDKwEdcI/9kH/+8o+ZlAQpw+9vDOYBgZdaB+1kpgOyVa0h1qvh2khn3E5X48MrXUG07GHSXD+aHkQU2w9nggF2rXqY/cnPsh6kY5bkAxz9nydVL5ZuO+vZIbTc3DhvgfDtRA12mllJDNfcf8KEG5yzr1WIuc/MYaFUC7cx74KFTSRyhfP4ObFQSH6BlsNeFKe77uYZaJZF/B2g3mcMa8pQBPvIj+MQBhXgHuKKxTTH8y0sBV5VEBkYcoEc7WhADWboADfjJPl6mDYjTkaQhJA0IgIycgHQBihsjYwz6lAHuSYBKBHDTmVxCTBtQTNYS76BKGLCBz/FXVOvA+bQBtgQo9ic5lQeA0sImZYCUjJWSOGA/+YpqvNwDki4EtjIOZyo/2UfSLQRTDdSrBmjIf03ABcyqAdmzgGrtAAPZrwlogVUD1H8ywEG/agCgkvkCu2rA5h3wGGDhqJKpQc/8eWK1cfgOKGGnktnCYX4dSD8O3wHpA3pwj9P4otIBUq8DU++ADrxMRDirNcchoBJ6B+ygXDPgcRxa+Fo7YPOrAq5QyFgz3UfSj8MK8sQBUcYiXFRCLeCnHwF6lVI93QoD1CqpC1CN7+es0tr9/KpwH4GtSqw9AkSjTQSoVXJtzR9drtaQbR5+z5xcts23mfq7vf0P/dwpM3Idp1kAAAAASUVORK5CYII=',

            riftControl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABkCAMAAAB5NchtAAAAY1BMVEUAAAAAAAD//wDAwADx8QBAQAAQEADQ0ACAgACgoABwcABgYAAgIAD//wDg4AD//wD//wAwMACQjwD//wD//wD//wD//wD//wCwsAD//wBQUAD//wD//wD//wD//wD//wD//wCz89QSAAAAIXRSTlMAq6urq6urq6urq6urC6tWoaurQIErIGurdquLlhVLNmEagNWoAAAGW0lEQVR4Ae1abZOjOA+cFRjMS3ghZAKEhPz/X/ms4mkisui5ipdh6662P9wdlRvUltot2cnHvxJ/cT2W0/VPBf+8nUd6oD3f9mZxuPUVSVTTrok/z9GDJiCH427hpxbBrfnByI0Niei8U3hX96Lh4DPqmKVw2CH+0a09Q2QgYgaXz33iJ/WPFSQsxe9mUBJRHP1YR8rkvnc/nvX4jCF8bMj2fjztHB+oQwLGvpz2jZ9nTRDTAuP9c6/4URrTKsbyukd8G5KO8/W74+du9bEdYIyZDQSlqjxss/+6Ob4xJloqL7Q5FyLggEWQ/nyo03hDCp9sP1hwU+CJEfFTw3wyseok5/8zLfB8+U0GLVGBgF9hYMYd/jsjiXBw1oBe+XsufSMiA8FxSrkh1S4fRJSCWJjmXJO0EAwNP/ymS18rogYpD4nuh8NIVET8mCI3hiichZExmxwWHToG/gNDj3e7RFcHJ4qOnxsiiw+CpSc2y23iP7IciGjAywqiElWx7nl4zcCSDzql/8gyEcXivXSYjcFwRaCOcGEUhkuz4OOfg7vIZjEv43AhCusIGnTduIBUo+SRgdwGdohmBlw9D1yQZaf5K7yhYv8hDiTyXFjzE5aln31FDa0TC6P0lED+zGS7mI5CEp9aEmCrIgZcK3ikwKMxnEQ1E7EGzIdCbXlCACu05n+5ZPCHvjoshe/GRJOcELkK8BxGPTRN8BNdWnO74MVHUfdF0bE7+dgwAkTYA8Ihko7F+JyMKTCoeOGe4y8CNTH6twmIIhuiy4fESDREIRjA9xs3n0IiBK9yI6OHBMJ58BA1RJOMmJZjwEPBY9FDx02Z+LmACGeCn+8SECILXqzk5vw4YwbZg0D68N244+mBvYDyyBhOIKwKb/Aj8Mq/5YhwmeYRMLD8z+zhCCls8qkg5NCfwLpDmJAjDvG8L+f9CHN2BYwN0bgdgSOaBBpe1xE5QWBOTWWD5EdY6SYEzq5JSBvsmqZLc36OBhtYs4xfRHCSbQhUixLnTuRxupyd5VRiHgZRbkIAG1TCOAoUpMvjM6bTzOm134rAXXg0KMziCxprHNImFmOsIWrfJhCvExjh0RK5dkgLDRp69X43XiVwlZtsyaEL6RVxJN7h2wuWRnTj2mjIB5sEDkmM+JipPt/uhuZ5CLkvbfCfEQWI7xC83ZH7Z6AMPiZtUAdaNLSKRdzeHkgs3iZqMPGgpCI3ZrC2CYIC8QH7thEcRa0T9BLY4CqigiQK6Qo+TiSWOmATwQZXEdALiqaWH07v78P570P8+eerDb4cg9q2LctyKudrXU8RYvATL+9hg916/Gw5+x6OPXzQl8AkFmvQTi9rNojR8/KSw6l9vgJz7TuoRLDYaUi3wZBoPOh26uGEy3RnToY3dIhXxOtXEf4EMPzm4obmKN1pCYMjsEagJhq9jqep2Met2BkSGNw1An7tmIGE44B8Oyo2iMF9awJXueCGqOo1G4RXqwRS7GNvK8A9nVEkUGk93cuJgaOMOBApNqisT/pm4XlP08pt1y073EqvVRtaDR/y2YmpPGMNqwRCSEBr6Q1S5GNGYSTcVrPhSr1j8KwAcKieabdEnS4BxcxrpQI+Ooy1RtRB4lor8K8AdAgrijQJnLSzhVIBHx2mWiNiZv/3nsugAv46zDnR2jyeaTZ7/toEMTqFvw756B9o02CiSWB0f2EJJfLE5L4JUQ8EhfL+1omGt8B9g6+uM9JdgJQCUOqG9cuHP3BBzSi0CvQKa5ZgIzulP4NxMWMD6JLT2hZ0m8YQFOIPfE1AjbIHxvWcFZFvATRJW2UcLX+Nf/m6Re38ruoVTQ+KBK+rP3cZXHqUQ7HXhGqUA1lfHk+HOVW3kRipi88etQ14U69KEGj7cjpd7xXNl/cp+RdA72xLpLSGJN/85y24tltxQWtSG8Q0I7QRiuP/5bU+3i2RPQem3PGIM9zRbBof490rYmVMjdyPvBD/2wiwzeVKeLTgDUsQr81i3UpdHuGrcqvQ+vVc/utJKTJZsdkPSNSjMpAQIw4SmxqT2iTg2N8UHle0igkB24fXL6ldo7nQCy7txuH1a/rENZrD6VSWfdv25e10+vhO3FEDeS23H/CjImDAtdyOuAgGA67ldgPGss7ybTih0e2MMwlIxe3PYOynjz+CW8k4Xj/+Q/iL/wEs0FUtYkz0LgAAAABJRU5ErkJggg==',

            daydreamControl: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwIDEyNSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTAwIDEyNTsiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+LnN0MHtmaWxsOiMyODI4Mjg7fS5zdDF7ZmlsbDojQTBBMEEwO308L3N0eWxlPjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik01MC42LDExOWgtMC4yYy0xMC4xLDAtMTguNC04LjMtMTguNC0xOC40VjI2LjRDMzIsMTYuMyw0MC4zLDgsNTAuNCw4aDBDNjAuNiw4LDY5LDE2LjQsNjksMjYuNnY3NEM2OSwxMTAuNyw2MC43LDExOSw1MC42LDExOXoiLz48ZWxsaXBzZSBjbGFzcz0ic3QxIiBjeD0iNTAuNyIgY3k9Ijc5LjkiIHJ4PSI4LjQiIHJ5PSI4LjUiLz48ZWxsaXBzZSBjbGFzcz0ic3QxIiBjeD0iNTAuOCIgY3k9IjU4IiByeD0iOC40IiByeT0iOC41Ii8+PGVsbGlwc2UgY2xhc3M9InN0MSIgY3g9IjUwLjQiIGN5PSIyNy41IiByeD0iMTYuMSIgcnk9IjE2Ii8+PC9zdmc+',

            // Created by Arthur Shlain of the Noun Project.

            gamepadControl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABkCAMAAAB5NchtAAAAYFBMVEUAAAAAAAD//wDAwAD//wBAQACAgAD//wDw8AD//wD//wCgoAAwMADQ0AAgIAD//wCQkADg4AD//wBwcAD//wD//wD//wD//wBQUAD//wD//wD//wBgYACwsAD//wD//wCi9gSrAAAAIHRSTlMAq6urK6urVquBoaurq6sLq6uLq0AgFZarazZLq6t2YfI1sDIAAAUFSURBVHgB7ZnJdrM6EIRDScwDiBkP9vu/5ZUs+lpxbEmELP4F3y7nGLro6kGQrwMHBwcHBwcHB7yPJSe++cKRn+WFZz7uCD6eUxBIz7X/ladlAjEtp1+GX/DC4vk0PUUnpn57+PqOB4JFEpZAkcU+prV4wHJ5Yc5WCVs9HCZIyq4KVqpOQNI6kxBDkc8BMedQ3DfF7zMVPgy+cREAshO3skDSBN9pILnVG+JDEgU/aOBDWQSvFCWA1lvBACApgjdcEjjJybRcQOTkYQ5g8a2/7Gd8omAuGrJea01CQ0HsJyCl+HuoKFeJmYPBa4gAuAR7yVW9ymI2KlIAqY+ACbgGRIiVYCMl0OtyZua9uF8Cqv0CAIxrPQdE7pWCG9XxPgEMOMu7nSkDigrA2dkCAApTgBL9CwERgJjHAKJvqlIPB0SwS0CVJ0BJEwPJfAUSPQ86YHKPcirbC5OUJIApfJqzWCOX6xxoQPNAe+AxBC6URAUJeBAGbgRWLp2U3M1YSQKJRx9kQLFHwOVRaGMLlIHiCrT8i2e6Fhhwctfgs4wWLpHTiytaLwFXvXhHuk8C8Oc8aJzjmAMlCXj5ceolgJ6RBKyucy2gA252AWfg+hSQxpJeVqZi8hLQ6BCcBAjd+nd93xBonU0QBXtqIARw43H2CFisS5AvtF8AeDXBji5gVPUdA8DmBJrSmNAWjDyHkSQnAZGiCrwVUP+jERRfwVx9SNbtGcVzzlgXQpJBUnRXdqW05o424IB4FdByvk0ARZqGx+E6f1kRd8cmYAGxaxsK3Y4nSv7KDKR+m+CPzgPjOoOJAsgch4Hu/SE02AjTZsdmSj36kKbdfjoAS7/g9YmEvQ0AOFottAssQrq+NPqfcK6j0WF2yCBhHzXkCQARkYIf8Z3riAPMOudXGutRhILODWvmN9bc7KvIbivaFpLo06tIlpKCD4TWPrzTrd9RrW/nY/u+UnJ95q1juO5ibYLZloCp/pLUE9C97fyehomwDojavYosJ/3/D/vMpAhC0Im3tvZSaetDaxPQIqNahUlomps6nqO3fBdIAteVdMCrYBLRYYcOtrY3lti6iixXUoQUaPSe1CxA8xDESV9i7aWb3yp6pVq/89TLw+MGWL69TTEg4+qvDMh/14cLEDnmUJammZ5EydPLGsr0ApI2bUEJ2NqH9uKZI9XpK/nDkMxUXhofkJIimK/b+9BePAku0j8BiehUIs1aGrSogml5lZrKoU8f+nfhdd2rRRgW69ey9tsI1b5XYRiuW0Fs70P++aoZClbQCziAbDCvbc0PmxEUjX8furuQ3C2jrosYnvGJuoVENNElutKPQ/8+dHXhVQW8wSAdfy4yg2logdK/Dx1dOOs9x1OstO9MHBZQ+Lh+1GXk34f2LkxI89jHyxL3n16u6lN8v8XxQPn80FMA/LuQDKCYG5iAclsfArAYsBlumOB1Lh0AYTFgO3cywfNcSifS3QYQNZngOQgGINlvgMMEyoD/WwkZsN8EdxG2QOdrgL8J4t0cqD+9FYg/M8Bck4Trm3mdvVpW7TKAxtH8OonRW359eXErq/2j+fz/p6BF/pYWZg5CATUy9jFmQNI9PU1okX40AeJC//CkZO1iyACw9Z7Mfk9a6xCMAbvjmwqAkpVQZI6cxhlApJSrfdQLntxG58/PrVa68K+/YrxPUEzL4Jk1zuuvP4bTPf81Dg4ODg4ODg7+AwlERtddq/a6AAAAAElFTkSuQmCC',

            // Created by Garrett Knoll of the Noun Project.

            fullscreen: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABkCAMAAAB5NchtAAAAUVBMVEUAAAAAAAD//wCAgADAwABAQAD//wD//wD//wDx8QAQEADQ0AAwMACgoADh4QCwsABwcABgYABQUACQkAAgIAD//wD//wD//wD//wD//wD//wCYxtj5AAAAG3RSTlMAq6urq6tWK4Grq6urq6urq6urq6tAFZZmiyDXexdmAAACxklEQVR4Ae2a3W6cMBCF6wMkMeYf2qR9/wetdiPnDJtEYs6ialX5u9obW9/i8Qwe82NPofDz6Vt+/ZN5XvAtzx4BYZ7HEeirLxgcAto8HNiEL6h9Avo8RaAIPJRAY0h+gakhmyTQn5aIYqctQcJJLGIMbBGnsMpBuOAMkhKEU7hSAZiDTpuA2L7/nF0C6LIxI0igx8cTHSufQPaOQGqDyAygys/SKYA6XGkAjEGjg53GJ0D1CcCkBcAADHyQXgEuHgAlDOzAGopA3D7+SBTCoOKjWyEJINml9GKCZ4EogNUGsw+zfbaoCawAFrudXZgEkoCYBIHrwI4JbQsOLvYz7ZdaEdj4FLvLz3AErnrP9VuDJBAaTrMwIg6w0feiXgdRwNYiRsQB8oqxGikCOYGYUKqOMVJ2vIavLtBGYOBmcr+DTNx+mkDomE4aHKcOZrRXIPOpFi3VYdrbalQj4xLgKiowgnQBxrEX7iGHAHnOy8idLFWj3sg8cXqPAGuRXI10gUyvvJKMrEaygH23aoQInMJJAqHWBJoiUASKQBEoAkXg/xFImsBylsAETWBozxHopD6VHaULmNORB56K3AJvL1d+A3HXapC7lHxDfH1554/vXKB3a+2JQj+Y2Lf7rjkM2xq1S4A3HVmg3XVJjmK7I1UW6Hnz4jgd7/pEDmx/SD6ef+411ccYbrpbusCi9QpveoRJFOBodku1LumqCiS5X3zTJ14kAUaQs2POAYxjRWDe95om4a6AYZAEAWYRoRrddreiIJBXndVIrUWV2q5vbK/JzWhmkASs/3znnWFUBGpbjQRsLWoEgeH+i0OTPSe/gN3FQcRmEq/AZG8+VFqbS30Co7350OlMNfEJMIkN1T30TKetQyCTzv6AwinQ4xxipwnM2PH25OAVltRKAtN5X9N1FChfUhWBIvAAH7WW74of7NPuQuEvZ9lH5JznAfgAAAAASUVORK5CYII=',

            world: 'data:image/png;base64,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',

            // Created by Shawn Erdely of the Noun Project.

            gear: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABkCAMAAAB5NchtAAAAYFBMVEUAAAAAAAD//wCAgAAwMAD//wD//wDw8ABAQAD//wDAwAD//wD//wD//wD//wD//wDg4ACgoAD//wD//wDQ0AD//wD//wBgYACwsAD//wBwcAAgIAD//wCQkABQUAD//wBkLwXoAAAAIHRSTlMAq6urq1ahq6uBqyBAKxULq6uWdqtri6urS6urNqurYepOiRMAAAQVSURBVHgB7ZrdkqI6F4a/PIEAQeQHAVGx7/8uv90VndG9yMGQNFO7yue42/VWsv7D/z58+PDhv0tZ3VJHVR13t37oeKf42lXEDcltTwEpkFm76G8WawHSPQUUcFevaBj2FDBCrl7Jofhxqy9eBqg3EjA/bH7uKMpnBEKm3gF+xWdPN8c2XxcAPH63AqveaaB6RCgARR036XQ4+tpFoRBgH3FYDzhMGTPsDXDOG6Ar/3GGHlr1zuLElSOQ5S1gDvHSHsBFKXUG+OoBcvXOxaVDcIczZcAhov0sf5pxtOrfnHigXVhIBUH2E+VIGoCTVpJLA9DkL38ZRUFpnvYd03m5qnUSraf3M6EKzz7O/haSDExwjRyd/c0Kxjq87E1qK3fgK+wCgEVtRwNlYAQ0KoRT4BGUQKICyCCsLnVwUtuxwXFQAecgFzhE6P5atY2cGI3aAORqEy4NBDP63OC+WIDM6nU/bSM1BUdASXTGb06TkkQrhwZ5B/eMd07iFBIg2hQkTxcww+07xMpDD2sZu4l0Ar30gRNg5pdbGgC0DMIxsBWuDmk/Anf1Riu73qqTZ5AA45DOG2fnsjc8sDK9DELsKMP1zJOu2hJ9HvvXp32poJGtsmNDQi4BTlZfcumAdPX6fwg3uN61Plu2BOQBrFrj6u30Usi8NSHdUAO0WmPxzsG1ce4qmaDfEHwXX4vhO84vUbcChvfCV4IAX4GpfP1TAl0sATn4fwtQqwAbWqHkj0+zgzyWAODPr7P42wJGyHe8ggAfCHDCK+DNnnsIUJl/JzqD9d9brETUwuC/totfQKxUfAeO3tbp6qsFQ7RipBpPYq877wTRQrqpHNtWa9mPeorrgDyAaz7p1rJpVVLgW0idVxUMgPYtrjD1nzeEg+HBSV4Cs7SPFUqf9OW2kaRKXVM6ydUL/asnViNSpwKKwjWlIXzJ+ThpAIbb0/0L1uxPMEbZ0stO63m6phjSvgCAZe1v5livE5NMBw2v2FwJRMKIvKa5txmOpk3UCpHekeoOrFonyS/6ksvsF3U877fvqTIX/2HMwCVgU1qEO0DAkmoKdwMTtqlsQyPhFrqobGD+q6vac+Ad1ECrtnMBDrsFgSQB+ghp4K62cc3cKiGIOuDJ5ASmjP9otSw+Pcli9fXNfvxns+QE0Kw9nOkGILsL+3EUTM/k6pDZoX1vIZNGvBeFKUD/fp81IJskgGE2j63tXTychiuw11/rrlTmJ+12l8cCyKYFYT+M44ijc14N+FJeisNUcT9gGADoH1EtZxALD4uVARiP8T9dorvJ2VkI+F5dmy794Y9YBrhE7UCDZ+crsKN9+RHJBMWeAiqAxp71N609wc5fUtUGQbXvx4R9xyum39W+o6rm9Ju52t/4hw8fPkTk/7PwOIFSnWjiAAAAAElFTkSuQmCC',

            // Created by Guilhem of the Noun Project.

            backArrow: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAABkCAMAAAB5NchtAAAAJFBMVEUAAAD//wD//wD//wD//wD//wD//wD//wD//wD//wD//wD//wD1AQnGAAAADHRSTlMAq2uLC6EgdjuBKxXxMof/AAAAfElEQVR42u3ZMRaCMBREUX5IQGH/+8XC0tbMUe7dwJsiqf4CAAC/4NzH+gj2t1EvR7hfe7hfz3C/Qo+gr+9+09fX19fX19fX1/++raZpffmgJmrpAXX7AS3+CPPf0AILLLDAAgsssMACCyYcLAInm8DRKnC2Cx4uAQDgX12bvgZPVbPIBgAAAABJRU5ErkJggg==',

        };

        // Imports.

        this.util = util,

        this.webgl = webgl,

        this.webvr = webvr,

        // Controls.

        this.controls = null, // DOM element wrapping controls below.

        // Buttons (DOM elements).

        this.vrButton = null,

        this.fullscreenButton = null,

        this.worldButton = null,

        this.poseButton = null,

        this.exitFullscreenButton = null,

        this.exitVRButton = null;

        /* 
         * Styles for the 2d Ui. zIndex values, added to the current zIndex of the 
         * <nav> or other navigation element (control panel).
         */

        this.styles = {

            controls: {

               boxSizing: 'border-box',

                zIndex: 10

            },

            modal: {

                zIndex: 50

            },

            button: {

                backgroundSize: 'cover',

                backgroundColor: 'transparent',

                border: '0',

                userSelect: 'none',

                webkitUserSelect: 'none',

                MozUserSelect: 'none',

                cursor: 'pointer',

                position: 'absolute',

                top: '0px',

                left: '0px',

                width: '64px',

                height: '50px',

                padding: '12px',

                margin: '8px',

                zIndex: 100,

                boxSizing: 'content-box',

                display: 'inline-block'

            },

            em: {

                zIndex: 101

            },

            strikethrough: {

                zIndex: 102

            },

            progress: {

                zIndex: 7999

            },

            menuContainer: {

                cursor: 'pointer',

                fontSize: '16px',

                position: 'relative',

                maxHeight: '180px',

                overflow: 'hidden',

                padding: '0',

                borderRadius: '8px',

                zIndex: 8999

            },

            menu: {

                width: '100%',

                height: '100%',

                margin: '0',

                padding: '0',

                overflowY: 'auto',

                fontSize: '16px',

                lineHeight: '18px',

                paddingLeft: '0px',

                paddingRight: '18px' // hides the scrollbar

            },

            menuItem: {

                margin: '0',

                padding: '0',

                listStyle: 'none',

                textAlign: 'center'

            },

            spinner: {

                zIndex: 9998

            },

            tooltip : {

                position: 'absolute',

                fontSize: '14px',

                lineHeight: '16px', // vertically center

                fontFamily: 'sans-serif',

                padding: '4px',

                padingBottom: '0px',

                borderRadius: '9px',

                left: '0px',

                top: '0px',

                backgroundColor: 'rgba(248,255,164,0.7)', // light yellow

                zIndex: '10000',

                display: 'none'

            }

        }

        // EventHandler ES6 kludges. Rebind handlers so we can use removeEventListener.

        this.vrHandleKeys = this.vrHandleKeys.bind( this );

        // save old DOM style

        if ( init ) {

           this.init( this.UI_DOM );

        }

    }

    /** 
     * Initialize our Ui
     */
    init ( uiMode ) {

        if ( ! uiMode ) {

            console.log( 'no mode provided, setting default' );

            uiMode = this.mode;

        }

        // Listen to fullscreen change events.

        document.addEventListener( 'webkitfullscreenchange', this.fullscreenChange.bind( this ), false );

        document.addEventListener( 'mozfullscreenchange', this.fullscreenChange.bind( this ), false );

        document.addEventListener( 'msfullscreenchange', this.fullscreenChange.bind( this ), false );

        // Click event for closing open menus and ui elements, if the user clicks outside of them.

        document.addEventListener( 'click', this.clickChange.bind( this ), false );

        // Keep track of whether mouse is down (for desktop dragging).

        //document.addEventListener( 'mousedown', ( evt ) => { this.mouseIsDown = true; }, false );

        //document.addEventListener( 'mouseup', ( evt ) => { this.mouseIsDown = false }, false );

        this.createUi(); // starting configuration

    }

    /**
     * Error Condition when there is no WebGL
     */
    initNoGL () {

        this.modalMessage( 'WebGL is not present on your system' );

    }

    /** 
     * Error condition when WebGL fails.
     */
    initBadGL () {

        this.modalMessage( 'WebGL is present, but failed to load' );

    }

    /** 
     * Set the World object, which has a list of Worlds and other data 
     * we can display in our Ui.
     * @param {World} world the current World.
     */
    setWorld ( world ) {

        this.world = world;

    }

    /* 
     * ---------------------------------------
     * Ui SETUP AND CONFIGURATION
     * ---------------------------------------
     */


     /** 
      * Add a CSS rule to the first stylesheet of the browser. use for properties (e.g. :before, :after) that
      * can't be easily set up via element.styles.xxx methods.
      * @link http://fiddle.jshell.net/MDyxg/1/
      * Example: addCSSRule("body:after", "content: 'foo'");
      * @param {String} selector the CSS selector.
      * @param {String} styles the associated CSS styles.
      */
    addCSSRule ( selector, styles ) {

    let sheet = document.styleSheets[ 0 ];

        if ( sheet.insertRule ) {

            return sheet.insertRule( selector + " {" + styles + "}", sheet.cssRules.length );

        } else if ( sheet.addRule ) {

            return sheet.addRule( selector, styles );

        }

    }

    /** 
     * Set the Ui controls (visible, active, inactive) by the current mode.
     */
    setControlsByMode( mode ) {

        switch ( this.mode ) {

              case this.UI_VR:

                this.exitVRButton.show();

                this.vrButton.hide();

                this.fullscreenButton.hide();

                break;

            case this.UI_FULLSCREEN:

                this.vrButton.hide();

                this.fullscreenButton.hide();

                this.exitFullscreenButton.show();

                break;

            case this.UI_DOM:

                this.exitVRButton.hide();

                this.exitFullscreenButton.hide();

                this.vrButton.show();

                this.fullscreenButton.show();

            default:

                break;

        }

        //TODO: switch() toggle control configurations.

        // TODO: use this to control event handler response

        // TODO: bind all the event handlers as separate functions in the constructor

    }

    /** 
     * Global test for click. If something is open, and the user clicked outside it, close.
     */
    clickChange ( evt ) {

        evt.preventDefault();

        evt.stopPropagation();

        // If the World menu is open, close it.

       if( ! this.worldMenu.contains( evt.target ) ) {

            this.worldMenu.hide();

       }

    }

    /** 
     * Create the default DOM ui.
     */
    createUi () {

        console.log( 'entering DOMUi')

        let c = this.webgl.getCanvas(),

        p = c.parentNode;

        // c.parentNode should be a <div> or <nav> that gets ALL the DOM styling. Don't touch <canvas>.

        // TODO: set local style of <canvas> to width=100%, height = 100%

        // TODO: test with fullscreen <canvas> style (attached to document.body)

        // Set some local styles overriding any conflicting styles for parentNode.

        p.style.margin = '0';

        p.style.border = '0';

        p.style.padding = '0';

        // Check for control HTML markup, create if necessary.

        let controls = c.parentNode.querySelector( '.webvr-mini-controls' );

        if ( ! controls ) {

            this.controls = document.createElement( 'nav' );

            controls.style.zIndex = this.styles.controls.zIndex;

            controls.style.position = 'relative';

            p.appendChild( controls );            

        } else { // create control bar, attach to <canvas> parent

            this.controls = controls;

            if ( parseInt( controls.style.zIndex ) < this.styles.controls.zIndex ) {

                controls.style.zIndex = this.styles.controls.zIndex;

                controls.style.position = 'relative';

            }


        }

        // document.styleSheets[0].addRule('p.special:before', 'content: "' + str + '";');

        // save the base zIndex to add to individual controls.

        // Create an information tooltip on mouse hover (only one).

        this.tooltip = this.createTooltip();

        // Ui for HTML5 canvas present.

        if ( c ) {

            // WebVR object methods to connect.

            let vr = this.webvr;

            console.log( 'creating DOM Ui');

             /* 
              * ================ VR button =====================
              */

            let vrButton = this.createButton( 'vrButton', this.icons.vr, 0, 0 );

            vrButton.tooltipActive = 'go to vr mode',

            vrButton.tooltipInactive = 'vr mode not available';

            vrButton.inactivate();

            vrButton.show(); // initially .active === true

            /* 
             * Set the emitter (pseudo-event 'vrdisplay'). If the 
             * device is recognized, use a custom icon. If there is a lag, 
             * the inactive generic VR icon will be visible until the device initializess.
             */

            this.util.emitter.on( this.util.emitter.events.VR_DISPLAY_READY, 

                ( device ) => {

                    if ( device.displayName ) {

                        let dName = device.displayName.toLowerCase();

                        if ( dName.indexOf( 'vive') !== this.util.NOT_IN_LIST ) {

                            vrButton.src = vrButton.src = this.icons.htcvive;

                            // Look for emulated display.

                            if ( dName.indexOf( 'emulat' ) !== this.util.NOT_IN_LIST ) {

                                vrButton.emulated( this.icons.emulated );

                            }

                        } else if ( dName.indexOf( 'oculus' ) !== this.util.NOT_IN_LIST ) {

                            vrButton.src = vrButton.src = this.icons.oculusrift;

                        }

                        // NOTE: FF uses OpenVR HMD, which doesn't return the name of the device!

                    }

                    vrButton.activate();

                } );

            // If the VR display initializes but crashes, also turn off.

            this.util.emitter.on( this.util.emitter.events.VR_DISPLAY_FAIL, 

                ( device ) => {

                    vrButton.inactivate();

            } );

            this.vrButton = vrButton;

            // Go to VR mode.

            vrButton.addEventListener( 'click' , ( evt ) => {

                evt.preventDefault();

                evt.stopPropagation();

                if ( ! this.vrButton.active ) return; // don't process click if inactive

                console.log( 'clicked vr button...' );

                this.vrButton.hide();

                this.fullscreenButton.hide();

                this.exitVRButton.show();

                // Set the mode (DOM -> WebVR stereo).

                this.mode = this.UI_VR;

                this.fullscreenChange( evt );

                // Add a keydown event to make VR entry and exit like fullscreen.

                addEventListener( 'keydown', this.vrHandleKeys );

                // Request VR presentation. This may take a few seconds (spinner).

                vr.requestPresent();

            } );

            /* 
             * ================ VR exit arrow =====================
             */

            let exitVRButton = this.createButton( 'exitVR', this.icons.backArrow, 0, 0 );

            exitVRButton.tooltipActive = 'exit from VR',

            exitVRButton.tooltipInactive = '';

            if ( vr.hasWebVR() ) {

                exitVRButton.activate();

            } else {

                exitVRButton.inactivate();

            }

            exitVRButton.hide();

            this.exitVRButton = exitVRButton; // save reference

            // Bind our pseudo-event to activating the button (so it waits for the webvr display).

            this.util.emitter.on( this.util.emitter.events.VR_DISPLAY_READY, exitVRButton.activate );

            // Return from VR button listener.

            exitVRButton.addEventListener( 'click', ( evt ) => {

                evt.preventDefault();

                evt.stopPropagation();

                console.log( 'clicked exit vr button' );

                this.exitVRButton.hide();

                this.vrButton.show();

                this.fullscreenButton.show();

                // Call webvr presentation exit (which may fail).

                vr.exitPresent();

                removeEventListener( 'keydown', this.vrHandleKeys );

            } );

            /* 
             * ================ Fullscreen button =====================
             */

            let fullscreenButton = this.createButton( 'fullscreen', this.icons.fullscreen, 0, 72 );

            fullscreenButton.tooltipActive = 'go to fullscreen mode',

            fullscreenButton.tooltipInactive = 'fullscreen mode not available';

            fullscreenButton.show(); // initially .active === true

            if ( this.hasFullscreen() ) { 

                fullscreenButton.activate();

            } else {

                fullscreenButton.inactivate();

            }

            // Attach DOM element directly, and via controls DOM element.

            this.fullscreenButton = fullscreenButton;

            // Go to fullscreen mode.

            fullscreenButton.addEventListener( 'click', ( evt ) => {

                evt.preventDefault();

                evt.stopPropagation();

                if ( ! this.fullscreenButton.active ) return; // don't process click if inactive

                console.log( 'clicked fullscreen button...' );

                const f = Math.max( window.devicePixelRatio, 1 );

                // Get the current size of the parent.

                this.oldWidth  = p.clientWidth  * f | 0;

                this.oldHeight = p.clientHeight * f | 0;

                // Set style of enclosing element <div><canvas><</div> to screen size.

                p.style.width = this.util.getScreenWidth() + 'px';

                p.style.height = this.util.getScreenHeight() + 'px';

                // Set the mode (DOM -> Fullscreen)

                this.mode = this.UI_DOM;

                // Fire the request fullscreen command.

                this.requestFullscreen();

            } );

            /* 
             * ================ Exit fullscreen button =====================
             */

            let exitFullscreenButton = this.createButton( 'exitFullscreen', this.icons.backArrow, 0, 0 );

            exitFullscreenButton.tooltipActive = 'exit from Fullscreen',

            exitFullscreenButton.tooltipInactive = '';

            if ( this.hasFullscreen() ) {

                exitFullscreenButton.activate();

            } else {

               exitFullscreenButton.inactivate();

            }

            exitFullscreenButton.hide();

            this.exitFullscreenButton = exitFullscreenButton;

            // Return from fullscreen button listener.

            exitFullscreenButton.addEventListener( 'click' , ( evt ) => {

                evt.preventDefault();

                evt.stopPropagation();

                if ( ! this.exitFullscreenButton.active ) return;

                console.log( 'clicked exit fullscreen button...' );

                // Fire the exit fullscreen event (also triggered by escape key).

                this.exitFullscreen();

            } );

            this.exitFullscreenButton = exitFullscreenButton;

            /* 
             * ================ World select button =====================
             */

            let worldButton = this.createButton( 'worlds', this.icons.world, 0, 144 );

            worldButton.tooltipActive = 'Select a World',

            worldButton.tooltipInactive = 'No Worlds Available';

            worldButton.activate();

            worldButton.show();

            // Attach DOM element directly, and via controls DOM element.

            this.worldButton = worldButton;

            // WorldButton controls the scene menu.

            worldButton.addEventListener( 'click' , ( evt ) => {

                evt.preventDefault();

                evt.stopPropagation();

                if ( ! this.worldButton.active ) return;

                console.log( 'clicked world scenes...' );

                // Get a list of Worlds, and display to use in popup select menu.

                let worldMenu = this.worldMenu;

                let scrollTo = worldMenu.buildList( this.world.getWorldScenes() );

                worldMenu.activate();

                // Define a scroll to center.

                worldMenu.show( scrollTo );

            } );

            /* 
             * ================ World Scene menu =======================
             */

            // Note: controls is always box-sizing = 'border-box';

            let menuTop = parseFloat( worldButton.style.top ) + parseFloat( worldButton.style.height ) + 10;

            let menuLeft = parseFloat( worldButton.style.left ) + parseFloat( worldButton.style.width ) / 2;

            let worldMenu = this.createMenu( 'worldMenu', null, menuTop, menuLeft );

            // Allow World selection.

            worldMenu.addEventListener( 'click', ( evt ) => {

                console.log( 'World name:' + evt.target.innerHTML )

                // Commit.

                console.log("CHANGING WORLD TO:" + evt.target.innerHTML );

                worldMenu.hide();

            } );

            // Detect element moving on mobile.

            worldMenu.addEventListener ( 'touchstart', ( evt ) => {

                console.log('start touch')

            } );

            /** 
             * Move event on mobile
             */
            worldMenu.addEventListener( 'touchmove', ( evt ) => {

                console.log('touch in menu')

                // TODO:

            } );

            worldMenu.addEventListener( 'touchend', ( evt ) => {

                console.log('end touch')

            } );

            // Hide for now.

            worldMenu.hide();

            /*
             * =============== End of Menus =============================
             */

            // Attach.

            this.worldMenu = worldMenu;

            // Append the buttons to the DOM.

            controls.appendChild( vrButton );

            controls.appendChild( exitVRButton );

            controls.appendChild( fullscreenButton );

            /*
             * TODO: FF had document.exitFullscreen, but it is ZAPPED when we try to add this button, and becomes the 
             * exitFullscreenButton!!!!!!!!!!!!!!!!!
             * So, in the exit, check if typeof document.exitFullscreen === 'function', and only use if it is
             */

            controls.appendChild( exitFullscreenButton );

            controls.appendChild( worldButton );

            controls.appendChild( worldMenu );

        } else {

            console.error( 'Ui::createDOMUi(): canvas not defined' );

        }

    }

    /* 
     * ---------------------------------------
     * UI FACTORY FUNCTIONS
     * ---------------------------------------
     */

    createUiElement ( elem, name, className, top, left, zIndex, display ) {

        elem.className = 'webvr-mini-' + name;

        // Create button styles.

        let s = elem.style;

        let styleObj = this.styles[ name ];

        for ( let i in styleObj ) {

            s[ i ] = styleObj[ i ];

        }

        // Convert to CSS property value if a number was supplied.

        if ( this.util.isNumber( top ) ) {

            s.top = parseFloat( top ) + 'px';

        }

        if ( this.util.isNumber( left ) ) {

            s.left = parseFloat( left ) + 'px';

        }

        if ( this.util.isNumber( zIndex ) ) {

            s.zIndex = parseInt( zIndex );

        }

        if( display ) s.display = display;

        // Prevent button from being selected and dragged.

        elem.draggable = false;

        elem.addEventListener( 'dragstart', ( evt ) => {

            evt.preventDefault();

            evt.stopPropagation();

        } );

        // by default, button is active.

        elem.active = true;

        return elem;

    }

    /** 
     * Create a Ui button
     */
    createButton ( name, buttonIcon, top, left, zIndex, display, options = {} ) {

        let button = this.createUiElement (document.createElement( 'img' ), 'button', 'webvr-mini-button', top, left, zIndex, display );

        button.name = name;

        // Set the icon.

        button.src = buttonIcon;

        // Button tooltip messages

        button.tooltipActive = '',

        button.tooltipInactive = '',

        // Style it on hover for desktops.

        button.addEventListener( 'mouseenter', ( evt ) => {

            let b = evt.target;

            let st = b.style;

            st.filter = st.webkitFilter = 'drop-shadow(0 0 6px rgba(255,255,255,1))';

            let tt = b.parentNode.querySelector( '.webvr-mini-tooltip' );

            let ts = tt.style;

            tt.status = 'visible'; // Manage mousleave with setTimeout below

            // Deactivate tooltip if necessary.

            if ( ! b.active ) {

                tt.innerHTML = b.tooltipInactive;

            } else {

                tt.innerHTML = b.tooltipActive;

            }

            // Delay appearance of tooltip after mouse hover starts.

            tt.tid = setTimeout( () => {

                if ( tt.status === 'visible' ) {

                    ts.left = ( 16 + parseFloat( st.left ) + parseFloat( st.width ) ) + 'px',

                    ts.top = ( 2 + parseFloat( st.top) ) + 'px';

                    ts.display = 'inline-block';

                    // Make the tooltip disappear after a time limit (needed for mobile).

                    tt.t2id = setTimeout( () => {

                        let evt = new Event( 'mouseleave' );

                        button.dispatchEvent( evt );

                    }, 3000 );

                }

             }, 900);


        } );

        // Set tooltip to invisible after mouse leaves.

        button.addEventListener( 'mouseleave', ( evt ) => {

            let b = evt.target;

            let st = b.style;

            st.filter = st.webkitFilter = '';

            let tt = b.parentNode.querySelector( '.webvr-mini-tooltip' );

            tt.status = 'invisible'; // flag compensating for setTimeout above

            if ( tt.tid ) {

                clearTimeout( tt.tid );

                tt.tid = null;

            }

            if ( tt.t2id ) {

                tt.t2id = null;

            }

            tt.style.display = 'none';

            tt.innerHTML = '';

        } );

        // Show the button onscreen. Also set activation/deactivation of its strikethrough.

        button.show = () => {

            button.style.display = 'inline-block';

            if ( button.active ) {

                button.strikethroughImg.style.display = 'none';

            } else {

                button.strikethroughImg.style.display = 'inline-block';

            }

        }

        // Hide the button onscreen.

        button.hide = () => {

            button.style.display = 'none';

            button.strikethroughImg.style.display = 'none';

        }

        // Add the emulated symbol underneath a given button.

        button.emulated = ( emuImg ) => {

            if ( ! button.emulatedImg ) {

                let emu = document.createElement( 'img' );

                emu.style.position = 'absolute',

                emu.style.top = '0',

                emu.style.left = button.style.left,

                emu.style.padding = button.style.padding,

                emu.style.zIndex = this.styles.emu.zIndex,

                emu.style.display = 'none',

                emu.src = emuImg,

                button.emulatedImg = emu, // save a reference to emulation in the original button.

                this.controls.appendChild( emu );

            }

        }

        // Add a strikethrough image link

        button.strikethrough = ( strikeImg ) => {

            if ( ! button.strikethroughImg ) {

                let strike = document.createElement( 'img' );

                strike.style.position = 'absolute',

                strike.style.top = button.style.top,

                strike.style.left = button.style.left,

                strike.style.width = button.style.width,

                strike.style.height = button.style.height,

                strike.style.padding = button.style.padding,

                strike.style.margin = button.style.margin,

                strike.style.zIndex = this.styles.strikethrough.zIndex,

                strike.style.display = 'none',

                strike.src = strikeImg,

                strike.name = 'strikethrough',

                button.strikethroughImg = strike; // save a reference to strikethrough in the original button.

                this.controls.appendChild( strike );

            }

        }

        // Set the strikethrough.

        button.strikethrough( this.icons.strikethrough );

        // Display and activate the button.

        button.activate = () => {

            button.active = true;

            if ( button.strikethroughImg ) button.strikethroughImg.style.display = 'none';


        }

        // Display the button, but deactivate it.

        button.inactivate = () => {

            button.active = false;

            if ( button.strikethroughImg ) button.strikethroughImg.style.display = 'inline-block';

        }

        // Return the completed button.

        return button;

    }

    /** 
     * Create a modal dialog.
     */
    createModal ( name, modalIcon, top, left, zIndex, display, options = {} ) {

        let modal = this.createUiElement ( document.createElement( 'div' ), 'modal', 'webvr-mini-modal', top, left, zIndex, display );

        modal.name = name;

        modal.show = () => {

            modal.style.display = 'inline-block';

        }

        modal.hide = () => {

            modal.style.display = 'none';

        }

        return modal;

    }

    /** 
     * Create a DOM-based modal dialog
     * TODO: REMOVE LATER
     */
    modalMessage( msg ) {

        // TODO: create modal dialog

        console.error( msg );

    }

    /** 
     * Create a loading progress bar.
     */
    createProgress ( name, progressIcon, top, left, zIndex, display, options = {} ) {

        let progress = this.createUiElement ( document.createElement( 'img' ), 'progress', 'webvr-mini-progress', top, left, zIndex, display );

        progress.name = name;

        progress.show = () => {

            progress.style.display = 'inline-block';

        }

        progress.hide = () => {

            progress.style.display = 'none';

        }

        return progress;

    }

    /** 
     * Create a selectable menu.
     */
    createMenu ( name, menuIcon = null, top, left, zIndex, display, options = {} ) {

        let menu = this.createUiElement( document.createElement( 'div' ), 'menuContainer', 'webvr-mini-menu', top, left, zIndex, display );

        let menuList = document.createElement( 'ul' );

        // Assign default style.

        for ( let i in this.styles.menu ) {

            menuList.style[ i ] = this.styles.menu[ i ];

        }

        menuList.style.border = '1px solid black'; //////////////////////////TEMPORARY

        menu.appendChild( menuList );

        menu.name = name;

        menu.style.backgroundColor = 'white';

        // Build an empty menu item.

        menu.buildItem = ( key, value ) => {

            let domItem = document.createElement( 'li' );

                let s = domItem.style;

                for ( let j in this.styles.menuItem ) {

                    s[ j ] = this.styles.menuItem[ j ]

                }

            domItem.innerHTML = '<div id=' + key + '>' + value + '</div>';

            return domItem;

        }

        // Timeout ID for setTimeout.

        menu.mid = null;

        // End timeout.

        menu.addEventListener( 'mouseenter', ( evt ) => {

            if ( menu.mid ) {

                clearTimeout( menu.mid );

                menu.mid = null;
            }

        } );

        // Set timeout.

        menu.addEventListener( 'mouseleave', ( evt ) => {

            menu.mid = setTimeout( () => {

                menu.hide();

            }, 900 );

        } );

        // Get a blank padding menu element.

        menu.blankItem = () => {

            let domItem = menu.buildItem( '-1', '-' );

            return domItem;

        }

        // Get the menu list.

        menu.getList = () => {

            return this.worldMenu.getElementsByTagName( 'ul' )[ 0 ];

        }

        // Create function for building the menu list.

        menu.buildList = ( listObj ) => {

            let domList = menu.getList();

            // Clear the menu.

            domList.innerHTML = '';

            let h = 0, itemCount = 0, scrollToChild = 0;

            /* 
             * Read the object and build the list. Recurse to find the topmost name 
             * of the supplied object.
             */

            // Add the list elements.

            for ( var i in listObj ) {

                let item = listObj[ i ];

                let domItem = menu.buildItem( i, item.name );

                // Select if active.

                if ( item.active ) {

                    domItem.style.backgroundColor = 'red';

                    domItem.active = true;

                    // Set scroll to active item.

                    scrollToChild = itemCount * parseFloat( this.styles.menu.lineHeight );

                }

                // TODO: when change active element, need to change domItem.active!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

                domList.appendChild( domItem );

                itemCount++;

            }

            let cn = domList.childNodes;

            // Assign an index by using .childNodes ordering.

            for ( let i = 0; i < domList.childNodes.length; i++ ) {

                cn[ i ].index = i;

            }

            return scrollToChild;

        }

        // Show the menu.

        menu.show = ( scroll ) => {

            console.log("MENU SCROLLTOP:" + scroll)

            menu.style.display = 'inline-block';

            let domList = menu.getList();

            domList.scrollTop = scroll || 0;

        }

        menu.hide = () => {

            menu.style.display = 'none';

        }

        menu.activate = () => {

        }

        menu.deactivate = () => {

        }

        menu.timeout = () => {

            // TODO: TIMEOUT FOR MENU IF NOT SELECTED.

        }

        return menu;

    }

    /** 
     * Create a loading spinner.
     */
    createSpinner ( name, spinnerIcon, top, left, zIndex, display, options = {} ) {

        let spinner = this.createUiElement ( document.createElement( 'img' ), 'spinner', 'webvr-mini-spinner', top, left, zIndex, display );

        spinner.name = name; // TODO ADD TO createUiElement

        spinner.show = () => {

            spinner.style.display = 'inline-block';

        }

        spinner.hide = () => {

            spinner.style.display = 'none';

        }

        return spinner;

    }

    /** 
     * Create a Ui tooltip
     * @param {String} activeMsg the message when a control is active.
     * @param {String} inactiveMsg the message when a control is inactive.
     * @param {Number} baseIndex the base zIndex to add our zIndex to.
     */
    createTooltip ( activeMsg, inactiveMsg ) {

        // Create an information tooltip on mouse hover (only one).

        let tooltip = document.createElement( 'p' );

        tooltip.className = 'webvr-mini-tooltip';

        tooltip.setAttribute( 'status', 'invisible' );

        let ts = tooltip.style;

        for ( let i in this.styles.tooltip ) {

            ts[ i ] = this.styles.tooltip[ i ]; // sets zIndex

        }

        tooltip.innerHTML = '',

        this.tooltip = tooltip,

        this.controls.appendChild( tooltip );

        return tooltip;

    }

    /* 
     * ---------------------------------------
     * MOUSE MOVE EVENTS
     * ---------------------------------------
     */

    /* 
     * ---------------------------------------
     * KEYDOWN EVENTS
     * ---------------------------------------
     */

    /** 
     * Add an escape key handler for entry into VR, similar to fullscreen. 
     * 
      * Note: we bind this 
     * sucker to itself(!) in the constructor, so that we can supply addEventListener with a named function, 
     * and remove it later. Otherwise, you can't remove handlers bound with addEventListener.
     */
    vrHandleKeys ( evt ) {

        switch ( evt.keyCode) {

            case 27: // ESC key

                console.log("AN ESCAPE");

                this.mode = this.UI_DOM;

                this.exitVRButton.hide();

                this.vrButton.show();

                this.fullscreenButton.show();

                // this.webvr.exitPresent handles some of the resizing, we have to restore the Uis.

                // exit VR presentation (order may be important here).

                this.webvr.exitPresent();

                // Remove the event listener

                removeEventListener( 'keydown', this.vrHandleKeys );

                break;

            default:

                break;

        }

    }

    /* 
     * ---------------------------------------
     * FULLSCREEN EVENTS
     * ---------------------------------------
     */

     hasFullscreen () {

        return ( !! (

            document.fullscreenEnabled || 

            document.webkitFullscreenEnabled || 

            document.mozFullScreenEnabled || 

            document.msFullscreenEnabled 

            )

        );

     }

    /** 
     * Cross-browser enter fullscreen mode. Note: this is called by an 
     * anonymous function bound to the fullscreen button in init().
     * @param {Event} fullscreen event.
     */
    requestFullscreen ( evt ) {

        let canvas = this.webgl.getCanvas();

        const parent = canvas.parentNode;

        if ( parent.requestFullscreen ) {

            parent.requestFullscreen();

        } else if ( parent.mozRequestFullScreen ) {

            parent.mozRequestFullScreen();

        } else if ( parent.webkitRequestFullscreen ) {

            parent.webkitRequestFullscreen();

        } else if ( parent.msRequestFullscreen ) {

            parent.msRequestFullscreen();

        }

    }

    /** 
     * Cross-browser exit fullscreen mode.
     * @param {Event} exit event.
     */
    exitFullscreen ( evt ) {

        if ( typeof document.exitFullscreen === 'function' ) {

            document.exitFullscreen();

        } else if ( document.mozCancelFullScreen ) {

            document.mozCancelFullScreen();

        } else if ( document.webkitExitFullscreen ) {

            document.webkitExitFullscreen();

        } else if ( document.msExitFullscreen ) {

            document.msExitFullscreen();

        }

    }

    /** 
     * Handle a fullscreen transition.
     * Note: used .bind() to bind to this object.s
     */
    fullscreenChange ( evt ) {

        let c = this.webgl.getCanvas(),

        p = c.parentNode,

        gl = this.webgl.getContext();

        switch ( this.mode ) {

            case this.UI_VR:

                console.log( 'from vr to dom...' );

                this.setControlsByMode( this.mode );

                break;

            case this.UI_FULLSCREEN:

                /* 
                 * Due to fullscreen API nastiness, you can't just call your standard resize() method
                 * and support the canvas jumping back to a DOM mode with CSS styles defined by an external 
                 * stylesheet. Additional resizing specific to exiting fullscreen has to be done here. 
                 * Removing the .style properties is particularly important.
                 *
                 * Note: UI_FULLSCREEN mode is actually from fullscreen to DOM.
                 * Note: UI_VR mode is from DOM to VR
                 */

                console.log( 'from fullscreen to DOM...' );

                // Kill local CSS styles ensuring we get a fullscreen view.

                p.style.width = '';

                p.style.height = '';

                // set the HTML5 canvas back to its original size, so it is synced with style in parentNode.

                let width = this.oldWidth;

                let height = this.oldHeight;

                // Set the WebGL viewport.

                gl.viewportWidth = width;

                gl.viewportHeight = height;

                gl.viewport( 0, 0, gl.viewportWidth, gl.viewportHeight );

                // Set the canvas size.

                c.width = width;

                c.height = height;

                this.mode = this.UI_DOM;

                // Hide the return button, if it wasn't already.

                this.setControlsByMode( this.mode );

                break;

            default:

            case this.UI_DOM:

                console.log( 'from DOM to fullscreen...' );

                // We hide fullscreen and vr in the calling functions...

                this.mode = this.UI_FULLSCREEN;

                this.setControlsByMode( this.mode );

                break;

        }

    }

}

// We put this here because of JSDoc(!).

export default Ui;