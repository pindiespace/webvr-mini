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

        // TODO: CHECK IF WEBVR IS AVAILABLE. IF SO, ALWAYS GO INTO VR MODE INSTEAD OF FULLSCREEN.

        /* 
         * icons from the noun project.
         * @link https://thenounproject.com/
         * Conversion of SVG to base64
         * @link http://b64.io/
         */
        this.icons = {

            // Created by Cyril S of the Noun Project.

            vr: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgOTAgMTEyLjUiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDkwIDkwIiB4bWw6c3BhY2U9InByZXNlcnZlIj48cGF0aCBkPSJNODEuNjcxLDIxLjMyM2MtMi4wODUtMi4wODQtNzIuNTAzLTEuNTUzLTc0LjA1NCwwYy0xLjY3OCwxLjY3OC0xLjY4NCw0Ni4wMzMsMCw0Ny43MTMgIGMwLjU1OCwwLjU1OSwxMi4xNTEsMC44OTYsMjYuMDA3LDEuMDEybDMuMDY4LTguNDg2YzAsMCwxLjk4Ny04LjA0LDcuOTItOC4wNGM2LjI1NywwLDguOTksOS42NzUsOC45OSw5LjY3NWwyLjU1NSw2Ljg0OCAgYzEzLjYzMy0wLjExNiwyNC45NTctMC40NTMsMjUuNTE0LTEuMDA4QzgzLjIyNCw2Ny40ODMsODMuNjcyLDIzLjMyNCw4MS42NzEsMjEuMzIzeiBNMjQuNTcyLDU0LjU4MiAgYy02LjA2MywwLTEwLjk3OC00LjkxNC0xMC45NzgtMTAuOTc5YzAtNi4wNjMsNC45MTUtMTAuOTc4LDEwLjk3OC0xMC45NzhzMTAuOTc5LDQuOTE1LDEwLjk3OSwxMC45NzggIEMzNS41NTEsNDkuNjY4LDMwLjYzNSw1NC41ODIsMjQuNTcyLDU0LjU4MnogTTY0LjMzNCw1NC41ODJjLTYuMDYzLDAtMTAuOTc5LTQuOTE0LTEwLjk3OS0xMC45NzkgIGMwLTYuMDYzLDQuOTE2LTEwLjk3OCwxMC45NzktMTAuOTc4YzYuMDYyLDAsMTAuOTc4LDQuOTE1LDEwLjk3OCwxMC45NzhDNzUuMzEyLDQ5LjY2OCw3MC4zOTYsNTQuNTgyLDY0LjMzNCw1NC41ODJ6Ii8+PC9zdmc+',

            htcvive: 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDkwIDExMi41IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA5MCAxMTIuNTsiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+LnN0MHtmaWxsOiMyODI4Mjc7fS5zdDF7ZmlsbDpub25lO3N0cm9rZTojRkZGRkZGO3N0cm9rZS13aWR0aDo3O3N0cm9rZS1taXRlcmxpbWl0OjEwO30uc3Qye2ZpbGw6IzI4MjgyNztzdHJva2U6I0EwQTBBMDtzdHJva2Utd2lkdGg6MjtzdHJva2UtbWl0ZXJsaW1pdDoxMDt9LnN0M3tmaWxsOm5vbmU7c3Ryb2tlOiNGRkZGRkY7c3Ryb2tlLXdpZHRoOjI7c3Ryb2tlLW1pdGVybGltaXQ6MTA7fS5zdDR7ZmlsbDojRkZGRkZGO30uc3Q1e2ZpbGw6bm9uZTtzdHJva2U6I0EwQTBBMDtzdHJva2Utd2lkdGg6MjtzdHJva2UtbWl0ZXJsaW1pdDoxMDt9PC9zdHlsZT48cG9seWdvbiBjbGFzcz0ic3QwIiBwb2ludHM9IjE2LDQxLjkgMTYsMzguNyAyMCwzMS40IDI1LjMsMjUgMzAuMywyMS4zIDM1LjYsMTguNSAzNS42LDMwLjkgMzEuNywzMy40IDI4LjYsMzYuMSAyOC43LDM4LjkgIi8+PHBvbHlnb24gY2xhc3M9InN0MCIgcG9pbnRzPSI3Niw0Mi45IDc2LDM5LjQgNzEuOSwzMS43IDY2LjUsMjQuOSA2MS40LDIxIDU2LDE4IDU2LDMxLjEgNTkuOSwzMy44IDYyLjgsMzUuNSA2My4xLDM3LjIgNjMuNCwzOS41ICIvPjxpbWFnZSBzdHlsZT0ib3ZlcmZsb3c6dmlzaWJsZTtlbmFibGUtYmFja2dyb3VuZDpuZXcgICAgOyIgd2lkdGg9IjE5MjAiIGhlaWdodD0iMTIwMSIgeGxpbms6aHJlZj0iQ0FDNjFEQjcuanBnIiAgdHJhbnNmb3JtPSJtYXRyaXgoMC45OTk4IDAgMCAwLjk5OTggLTQ5NzYuNzc1NCAtNDc2Ni4zNTk0KSI+PC9pbWFnZT48aW1hZ2Ugc3R5bGU9Im92ZXJmbG93OnZpc2libGU7ZW5hYmxlLWJhY2tncm91bmQ6bmV3OyIgd2lkdGg9IjE5MjEiIGhlaWdodD0iMTIwMSIgeGxpbms6aHJlZj0iQ0FDNjFEQjUuanBnIiAgdHJhbnNmb3JtPSJtYXRyaXgoMC45OTk0IDAgMCAwLjk5OTQgMzE0Ni4xNzgyIDM2NzkuNDY4OCkiPjwvaW1hZ2U+PHBhdGggY2xhc3M9InN0MCIgZD0iTTMzNjEuOCwzNjI5LjFoLTMyMi41Yy01MC43LDAtOTIuMi00MS41LTkyLjItOTIuMnYtMTMzLjVjMC00Ny40LDM4LjgtODYuMiw4Ni4yLTg2LjJoMzI4LjVjNTAuNywwLDkyLjIsNDEuNSw5Mi4yLDkyLjJ2MTI3LjVDMzQ1NC4xLDM1ODcuNiwzNDEyLjYsMzYyOS4xLDMzNjEuOCwzNjI5LjF6Ii8+PHBhdGggY2xhc3M9InN0MCIgZD0iTTMyNDMuNiwzMzI3LjFoLTg1LjVjLTYuNiwwLTEyLTUuNC0xMi0xMnYtMTM5LjVjMC02LjYsNS40LTEyLDEyLTEyaDg1LjVjNi42LDAsMTIsNS40LDEyLDEydjEzOS41QzMyNTUuNiwzMzIxLjcsMzI1MC4yLDMzMjcuMSwzMjQzLjYsMzMyNy4xeiIvPjxjaXJjbGUgY2xhc3M9InN0MSIgY3g9IjMwNDYuOCIgY3k9IjMzODMuNSIgcj0iMzIuNSIvPjxjaXJjbGUgY2xhc3M9InN0MSIgY3g9IjMzNjMuNiIgY3k9IjMzODMuNSIgcj0iMzIuNSIvPjxjaXJjbGUgY2xhc3M9InN0MSIgY3g9IjMyMDAuOCIgY3k9IjM1NzUuOCIgcj0iMzIuNSIvPjxjaXJjbGUgY2xhc3M9InN0MSIgY3g9IjMwMTQuMyIgY3k9IjM0OTAuNCIgcj0iMzIuNSIvPjxjaXJjbGUgY2xhc3M9InN0MSIgY3g9IjMzOTAuNiIgY3k9IjM0OTAuNCIgcj0iMzIuNSIvPjxjaXJjbGUgY2xhc3M9InN0MSIgY3g9IjMyMDAuOCIgY3k9IjM1NzYuOCIgcj0iMTcuNiIvPjxwb2x5bGluZSBjbGFzcz0ic3QxIiBwb2ludHM9IjMzMTAuOCwzMzE0LjEgMzI3OC43LDMzNTYuMyAzMjUxLjMsMzM3Ni4zIDMyMDQsMzM3Ni4zIDMxNDYuMSwzMzc2LjMgMzEyMS4zLDMzNTkuNyAzMDg5LjEsMzMxNy4xIi8+PHBvbHlnb24gY2xhc3M9InN0MCIgcG9pbnRzPSIzMDA0LjUsMzMzOS4xIDMwMDQuNSwzMzIxLjEgMzAzMSwzMjgwLjEgMzA2NiwzMjQ0LjUgMzA5OS41LDMyMjMuNiAzMTM0LjUsMzIwOC4xIDMxMzQuNSwzMjc3LjEgMzEwOSwzMjkxLjEgMzA5MC40LDMzMDYuOSAzMDg4LjUsMzMyMiAiLz48cG9seWdvbiBjbGFzcz0ic3QwIiBwb2ludHM9IjMzOTQsMzMzNi4xIDMzOTQsMzMxOC4xIDMzNjcuNSwzMjc3LjEgMzMzMi41LDMyNDEuNSAzMjk5LDMyMjAuNiAzMjY0LDMyMDUuMSAzMjY0LDMyNzQuMSAzMjg5LjUsMzI4OC4xIDMzMTAsMzMwNi41IDMzMTIuMywzMzE4LjQgIi8+PGxpbmUgY2xhc3M9InN0MSIgeDE9IjMyMDAuOCIgeTE9IjMzNzYuMyIgeDI9IjMyMDAuOCIgeTI9IjM1NDMuMyIvPjxwYXRoIGNsYXNzPSJzdDIiIGQ9Ik02OCw4OC41SDIyQzEwLjMsODguNSwwLjgsNzksMC44LDY3LjNWNTZjMC0xMC43LDguOC0xOS41LDE5LjUtMTkuNUg2OGMxMS43LDAsMjEuMiw5LjUsMjEuMiwyMS4ydjkuNkM4OS4zLDc5LDc5LjcsODguNSw2OCw4OC41eiIvPjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00NS41LDM4LjVMNDUuNSwzOC41Yy00LjcsMC04LjUtMy44LTguNS04LjVWMjBjMC00LjcsMy44LTguNSw4LjUtOC41aDAuMWM0LjcsMCw4LjUsMy44LDguNSw4LjV2MTBDNTQsMzQuNyw1MC4yLDM4LjUsNDUuNSwzOC41eiIvPjxlbGxpcHNlIHRyYW5zZm9ybT0ibWF0cml4KDAuOTIyOCAtMC4zODUzIDAuMzg1MyAwLjkyMjggLTE3LjgwMjUgMTAuOTM5MSkiIGNsYXNzPSJzdDMiIGN4PSIxOC40IiBjeT0iNDkuOSIgcng9IjMuOSIgcnk9IjUuNSIvPjxlbGxpcHNlIHRyYW5zZm9ybT0ibWF0cml4KDAuMzY1NSAtMC45MzA4IDAuOTMwOCAwLjM2NTUgLTAuMTc4NSA5OC42NDUxKSIgY2xhc3M9InN0MyIgY3g9IjcyLjMiIGN5PSI0OS41IiByeD0iNS41IiByeT0iNC4zIi8+PGVsbGlwc2UgY2xhc3M9InN0MyIgY3g9IjExLjUiIGN5PSI2NS4zIiByeD0iNSIgcnk9IjQuMyIvPjxlbGxpcHNlIGNsYXNzPSJzdDMiIGN4PSI3OC41IiBjeT0iNjUuMyIgcng9IjUiIHJ5PSI0LjMiLz48Y2lyY2xlIGNsYXNzPSJzdDQiIGN4PSI0NS41IiBjeT0iODAiIHI9IjEuNSIvPjxwb2x5bGluZSBjbGFzcz0ic3Q1IiBwb2ludHM9IjYzLjgsMzcuMiA1OC42LDQzLjUgNTQuMSw0Ni41IDQ2LjQsNDYuNSAzNi45LDQ2LjUgMzIuOSw0NCAyNy42LDM3LjYgIi8+PGxpbmUgY2xhc3M9InN0NSIgeDE9IjQ1LjUiIHkxPSI0Ni41IiB4Mj0iNDUuNSIgeTI9Ijc0LjUiLz48ZWxsaXBzZSB0cmFuc2Zvcm09Im1hdHJpeCgwLjU3NzMgLTAuODE2NiAwLjgxNjYgMC41NzczIC0zNy4yMDk2IDg3LjU2NjMpIiBjbGFzcz0ic3QzIiBjeD0iNjYiIGN5PSI3OS43IiByeD0iMy45IiByeT0iNSIvPjxlbGxpcHNlIHRyYW5zZm9ybT0ibWF0cml4KDAuNzA3MSAtMC43MDcxIDAuNzA3MSAwLjcwNzEgLTQ5LjY1NzQgMzkuNTA1KSIgY2xhc3M9InN0MyIgY3g9IjIyLjkiIGN5PSI3OS43IiByeD0iNSIgcnk9IjMuOSIvPjxlbGxpcHNlIGNsYXNzPSJzdDMiIGN4PSI0NS41IiBjeT0iODAiIHJ4PSI1IiByeT0iNS41Ii8+PC9zdmc+',

            oculusrift: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgOTAgMTEyLjUiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDkwIDExMi41OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHN0eWxlIHR5cGU9InRleHQvY3NzIj4uc3Qwe2ZpbGw6IzJEMkQyRDt9LnN0MXtmaWxsOiMyODI4Mjc7fS5zdDJ7ZmlsbDpub25lO3N0cm9rZTojRkZGRkZGO3N0cm9rZS13aWR0aDo3O3N0cm9rZS1taXRlcmxpbWl0OjEwO30uc3Qze2ZpbGw6bm9uZTtzdHJva2U6I0EwQTBBMDtzdHJva2Utd2lkdGg6MjtzdHJva2UtbWl0ZXJsaW1pdDoxMDt9LnN0NHtmaWxsOiMyODI4Mjc7c3Ryb2tlOiNBMEEwQTA7c3Ryb2tlLXdpZHRoOjI7c3Ryb2tlLW1pdGVybGltaXQ6MTA7fTwvc3R5bGU+PHBhdGggY2xhc3M9InN0MCIgZD0iTTcxLjUsNzYuN2wtNS43LTIuN2MtMS43LTAuOC0yLjUtMi45LTEuNy00LjdsNC42LTkuOGMwLjgtMS43LDIuOS0yLjUsNC43LTEuN2w1LjcsMi43YzEuNywwLjgsMi41LDIuOSwxLjcsNC43bC00LjYsOS44Qzc1LjQsNzYuOCw3My4zLDc3LjYsNzEuNSw3Ni43eiIvPjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0yMy40LDc0LjVsLTUuNywyLjRjLTEuOCwwLjctMy44LTAuMS00LjYtMS45TDksNjVjLTAuNy0xLjgsMC4xLTMuOCwxLjktNC42bDUuNy0yLjRjMS44LTAuNywzLjgsMC4xLDQuNiwxLjlsNC4xLDEwQzI2LjEsNzEuNywyNS4yLDczLjgsMjMuNCw3NC41eiIvPjxpbWFnZSBzdHlsZT0ib3ZlcmZsb3c6dmlzaWJsZTsiIHdpZHRoPSIxOTIwIiBoZWlnaHQ9IjEyMDAiIHhsaW5rOmhyZWY9IkNCMUE2Mjg5LmpwZyIgIHRyYW5zZm9ybT0ibWF0cml4KDEgMCAwIDEgLTQ5NzcgLTQ3NjYpIj48L2ltYWdlPjxpbWFnZSBzdHlsZT0ib3ZlcmZsb3c6dmlzaWJsZTsiIHdpZHRoPSIxOTIwIiBoZWlnaHQ9IjEyMDAiIHhsaW5rOmhyZWY9IkNCMUE2MjhGLmpwZyIgIHRyYW5zZm9ybT0ibWF0cml4KDEgMCAwIDEgMzE0Ni4wOTQgMzY3OS42MDM1KSI+PC9pbWFnZT48cGF0aCBjbGFzcz0ic3QxIiBkPSJNMzM2MS44LDM2MjkuMWgtMzIyLjVjLTUwLjcsMC05Mi4yLTQxLjUtOTIuMi05Mi4ydi0xMzMuNWMwLTQ3LjQsMzguOC04Ni4yLDg2LjItODYuMmgzMjguNWM1MC43LDAsOTIuMiw0MS41LDkyLjIsOTIuMnYxMjcuNUMzNDU0LjEsMzU4Ny42LDM0MTIuNiwzNjI5LjEsMzM2MS44LDM2MjkuMXoiLz48cGF0aCBjbGFzcz0ic3QxIiBkPSJNMzI0My42LDMzMjcuMWgtODUuNWMtNi42LDAtMTItNS40LTEyLTEydi0xMzkuNWMwLTYuNiw1LjQtMTIsMTItMTJoODUuNWM2LjYsMCwxMiw1LjQsMTIsMTJ2MTM5LjVDMzI1NS42LDMzMjEuNywzMjUwLjIsMzMyNy4xLDMyNDMuNiwzMzI3LjF6Ii8+PGNpcmNsZSBjbGFzcz0ic3QyIiBjeD0iMzA0Ni44IiBjeT0iMzM4My41IiByPSIzMi41Ii8+PGNpcmNsZSBjbGFzcz0ic3QyIiBjeD0iMzM2My42IiBjeT0iMzM4My41IiByPSIzMi41Ii8+PGNpcmNsZSBjbGFzcz0ic3QyIiBjeD0iMzIwMC44IiBjeT0iMzU3NS44IiByPSIzMi41Ii8+PGNpcmNsZSBjbGFzcz0ic3QyIiBjeD0iMzAxNC4zIiBjeT0iMzQ5MC40IiByPSIzMi41Ii8+PGNpcmNsZSBjbGFzcz0ic3QyIiBjeD0iMzM5MC42IiBjeT0iMzQ5MC40IiByPSIzMi41Ii8+PGNpcmNsZSBjbGFzcz0ic3QyIiBjeD0iMzIwMC44IiBjeT0iMzU3Ni44IiByPSIxNy42Ii8+PHBvbHlsaW5lIGNsYXNzPSJzdDIiIHBvaW50cz0iMzMxMC44LDMzMTQuMSAzMjc4LjcsMzM1Ni4zIDMyNTEuMywzMzc2LjMgMzIwNCwzMzc2LjMgMzE0Ni4xLDMzNzYuMyAzMTIxLjMsMzM1OS43IDMwODkuMSwzMzE3LjEgIi8+PHBvbHlnb24gY2xhc3M9InN0MSIgcG9pbnRzPSIzMDA0LjUsMzMzOS4xIDMwMDQuNSwzMzIxLjEgMzAzMSwzMjgwLjEgMzA2NiwzMjQ0LjUgMzA5OS41LDMyMjMuNiAzMTM0LjUsMzIwOC4xIDMxMzQuNSwzMjc3LjEgMzEwOSwzMjkxLjEgMzA5MC40LDMzMDYuOSAzMDg4LjUsMzMyMiAiLz48cG9seWdvbiBjbGFzcz0ic3QxIiBwb2ludHM9IjMzOTQsMzMzNi4xIDMzOTQsMzMxOC4xIDMzNjcuNSwzMjc3LjEgMzMzMi41LDMyNDEuNSAzMjk5LDMyMjAuNiAzMjY0LDMyMDUuMSAzMjY0LDMyNzQuMSAzMjg5LjUsMzI4OC4xIDMzMTAsMzMwNi41IDMzMTIuMywzMzE4LjQgIi8+PGxpbmUgY2xhc3M9InN0MiIgeDE9IjMyMDAuOCIgeTE9IjMzNzYuMyIgeDI9IjMyMDAuOCIgeTI9IjM1NDMuMyIvPjxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik00OC45LDMyLjVoLTQuOGMtMS43LDAtMy4xLTEuNC0zLjEtMy4xVjguNmMwLTEuNywxLjQtMy4xLDMuMS0zLjFoNC44YzEuNywwLDMuMSwxLjQsMy4xLDMuMXYyMC44QzUyLDMxLjEsNTAuNiwzMi41LDQ4LjksMzIuNXoiLz48bGluZSBjbGFzcz0ic3QzIiB4MT0iNTIiIHkxPSIxMy41IiB4Mj0iNDEiIHkyPSIxMy41Ii8+PHBhdGggY2xhc3M9InN0MCIgZD0iTTkuMiw2Ni44TDkuMiw2Ni44Yy0xLjQsMC4yLTIuNy0wLjctMi45LTJMMC45LDM1LjZjLTAuMi0xLjQsMC43LTIuNywyLTIuOWgwYzEuNC0wLjIsMi43LDAuNywyLjksMmw1LjQsMjkuMUMxMS40LDY1LjIsMTAuNSw2Ni41LDkuMiw2Ni44eiIvPjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik04MS40LDY3TDgxLjQsNjdjLTEuNC0wLjItMi4zLTEuNS0yLTIuOWw1LTI5LjZjMC4yLTEuNCwxLjUtMi4zLDIuOS0yaDBjMS40LDAuMiwyLjMsMS41LDIsMi45bC01LDI5LjZDODQuMSw2Ni4zLDgyLjgsNjcuMiw4MS40LDY3eiIvPjxwYXRoIGNsYXNzPSJzdDQiIGQ9Ik02Ni4yLDcwLjVIMjMuOGMtNy42LDAtMTMuOC02LjItMTMuOC0xMy44VjM5LjZjMC02LjYsNS40LTEyLjEsMTIuMS0xMi4xaDQ0LjJjNy42LDAsMTMuOCw2LjIsMTMuOCwxMy44djE1LjVDODAsNjQuMyw3My44LDcwLjUsNjYuMiw3MC41eiIvPjwvc3ZnPg==',

            emulated: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwIDEyNSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTAwIDEyNTsiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+LnN0MHtmaWxsOiNGRjczNzM7fTwvc3R5bGU+PHBhdGggY2xhc3M9InN0MCIgZD0iTTQ4LjgsMTA5LjlIMzIuNmMwLjEsMS40LDAuNCwyLjYsMSwzLjRjMC44LDEuMSwxLjgsMS42LDMsMS42YzAuOCwwLDEuNi0wLjMsMi4yLTAuN2MwLjQtMC4zLDAuOS0wLjgsMS4zLTEuNmw3LjgsMC45Yy0xLjIsMi41LTIuNyw0LjItNC4zLDUuM2MtMS43LDEuMS00LjEsMS42LTcuMywxLjZjLTIuOCwwLTQuOS0wLjQtNi41LTEuM2MtMS42LTAuOS0yLjktMi40LTMuOS00LjNjLTEtMi0xLjYtNC4zLTEuNi03LjFjMC0zLjgsMS03LDMuMS05LjNjMi4xLTIuNCw1LTMuNiw4LjYtMy42YzMsMCw1LjMsMC41LDcsMS42YzEuNywxLjEsMywyLjYsMy45LDQuNmMwLjksMiwxLjMsNC42LDEuMyw3Ljl2MS4xSDQ4Ljh6IE00MC40LDEwNS40Yy0wLjEtMS44LTAuNi0zLjItMS4yLTMuOWMtMC43LTAuOC0xLjYtMS4yLTIuNy0xLjJjLTEuMiwwLTIuMiwwLjctMywxLjhjLTAuNCwwLjgtMC44LDEuOC0wLjksMy4zSDQwLjR6Ii8+PHBhdGggY2xhc3M9InN0MCIgZD0iTTUxLjYsMTAxLjhsNC41LTAuNWwzLjcsMC41bDMuMiwxMS4xbDMuMi0xMS4xbDQuMy0wLjVsMy45LDAuNVYxMjBoLTVMNjkuMSwxMDhMNjUuMywxMjBoLTQuNmwtMy41LTExLjlMNTYuOSwxMjBoLTVMNTEuNiwxMDEuOEw1MS42LDEwMS44eiIvPjwvc3ZnPg==',

            // Added strikethrough.

            inactiveVR: 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgOTAgMTEyLjUiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDkwIDExMi41OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHN0eWxlIHR5cGU9InRleHQvY3NzIj4uc3Qwe2ZpbGw6IzYwNjA2MDt9LnN0MXtmaWxsOm5vbmU7c3Ryb2tlOiNGRjczNzM7c3Ryb2tlLXdpZHRoOjM7c3Ryb2tlLW1pdGVybGltaXQ6MTA7fTwvc3R5bGU+PHBhdGggY2xhc3M9InN0MCIgZD0iTTgxLjcsMjEuM2MtMi4xLTIuMS03Mi41LTEuNi03NC4xLDBjLTEuNywxLjctMS43LDQ2LDAsNDcuN2MwLjYsMC42LDEyLjIsMC45LDI2LDFsMy4xLTguNWMwLDAsMi04LDcuOS04YzYuMywwLDksOS43LDksOS43bDIuNiw2LjhjMTMuNi0wLjEsMjUtMC41LDI1LjUtMUM4My4yLDY3LjUsODMuNywyMy4zLDgxLjcsMjEuM3ogTTI0LjYsNTQuNmMtNi4xLDAtMTEtNC45LTExLTExYzAtNi4xLDQuOS0xMSwxMS0xMXMxMSw0LjksMTEsMTFDMzUuNiw0OS43LDMwLjYsNTQuNiwyNC42LDU0LjZ6IE02NC4zLDU0LjZjLTYuMSwwLTExLTQuOS0xMS0xMWMwLTYuMSw0LjktMTEsMTEtMTFjNi4xLDAsMTEsNC45LDExLDExQzc1LjMsNDkuNyw3MC40LDU0LjYsNjQuMyw1NC42eiIvPjxsaW5lIGNsYXNzPSJzdDEiIHgxPSI4NCIgeTE9IjYiIHgyPSIxOSIgeTI9Ijg5Ii8+PC9zdmc+',

            viveControl: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwIDEyNSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTAwIDEyNTsiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+LnN0MHtmaWxsOiMyODI4Mjg7fS5zdDF7ZmlsbDojQTBBMEEwO308L3N0eWxlPjxwb2x5Z29uIGNsYXNzPSJzdDAiIHBvaW50cz0iNDkuNiwzLjggNTcuMiw0LjYgNjUuNSw3LjMgNzEuNywxMS4yIDg0LjIsMjQgODUsMjYuNCA4NSwyOS42IDg0LDMxLjUgNzkuNywzNSA3Ny4yLDM1IDcxLjgsMzAuNiA2OC44LDMyLjYgNjcuMywzNSA2NS44LDM3LjcgNjUsNDMgNjEuNSwxMDkuNiA2MC45LDExMy42IDU5LjYsMTE2LjYgNTcuMiwxMTkuMyA1NC4zLDEyMS4xIDUwLjcsMTIxLjggNDYuNiwxMjEuMSA0My41LDExOS4zIDQxLjQsMTE2LjggNDAuMiwxMTMuMiAzNiw0MS44IDM0LjcsMzYuOCAzMy4yLDMyLjkgMjkuMywzMC41IDI0LjMsMzQuNyAyMS44LDM0LjYgMTYuOCwzMC45IDE2LDI3LjMgMTcuMywyNC42IDI5LjUsMTEuMiAzNy4zLDYuOCA0Myw0LjggIi8+PGVsbGlwc2UgY2xhc3M9InN0MSIgY3g9IjUwLjUiIGN5PSI1My4zIiByeD0iMTAuMiIgcnk9IjguOSIvPjxlbGxpcHNlIGNsYXNzPSJzdDEiIGN4PSI1MC45IiBjeT0iMTcuNSIgcng9IjE3LjYiIHJ5PSI4LjIiLz48L3N2Zz4=',

            riftControl: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwIDEyNSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTAwIDEyNTsiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+LnN0MHtmaWxsOiMyODI4Mjg7fS5zdDF7ZmlsbDojQTBBMEEwO30uc3Qye2ZpbGw6IzQ5NDk0OTt9PC9zdHlsZT48cGF0aCBjbGFzcz0ic3QwIiBkPSJNOTUuOSw0Ni4ybC0yLjEtOC45bC0zLjgtNi43bC03LjUtNi42bC02LjQtMy40bC02LjgtMi40TDU3LDE2bC05LjUtOGwtNy4yLTEuM0wzMC45LDlsLTcuNSwzLjJMMTIuNiwyMi43bC00LDYuM0w2LDM5Ljl2OC43bDEuMyw5LjJsNC4zLDExLjZsNi42LDExbDYuNCw1LjZsMjMuOSwxNC42bDkuOCwxLjFsMTEuMS0xLjNsOC45LTQuNWw3LTYuM2w3LjItMTAuNUw5NS45LDY5bDEuMS0xMy45TDk1LjksNDYuMnogTTg1LDY5LjNsLTIuMSwxMS42bC02LjQsNy43TDY3LDkyLjhsLTEzLjgtMmwtMTMuNi03LjZMMjcuOSw3MS41bC0zLjQtNS4ybC0yLjgtNi43TDE5LDUxLjhWNDEuNWwyLjEtOS4ybDMuNC03LjJsMy0xLjFoMS4zbDYuNCw4LjNsNS4xLDQuOUw3Myw1NmwxMC45LDMuNmwxLjEsMS44VjY5LjN6Ii8+PHBvbHlnb24gY2xhc3M9InN0MCIgcG9pbnRzPSI0MS42LDI1LjEgMjkuOSw2Ni4xIDI1LjIsODIgMjIuOSwxMDAuNCAyNS44LDExMC4yIDMwLjEsMTE0LjUgMzUuNCwxMTQuNSA0MC4xLDExMy40IDQ1LjQsMTA2LjkgNTAuNiw5NC44IDU0LjEsODUuNiA1OC42LDY2LjEgNjQuNCw1OC43IDc3LjIsNTcuNiA4Ny4yLDQ5LjEgIi8+PHBhdGggY2xhc3M9InN0MSIgZD0iTTkxLjYsNDMuM2MtMi40LDguMy0xNS43LDExLjUtMjkuOCw3UzM4LjQsMzUuNSw0MC43LDI3LjJzMTUuNy0xMS41LDI5LjgtN1M5NCwzNSw5MS42LDQzLjN6Ii8+PHBhdGggY2xhc3M9InN0MiIgZD0iTTY5LjIsMjkuOGMtMC42LDMuMi01LjEsNC45LTEwLDMuOXMtOC40LTQuNS03LjgtNy43czUuMS00LjksMTAtMy45UzY5LjgsMjYuNiw2OS4yLDI5Ljh6Ii8+PHBhdGggY2xhc3M9InN0MiIgZD0iTTYyLjIsNDIuMWMtMC41LDEuNC0yLjcsMS45LTQuOSwxYy0yLjItMC45LTMuNi0yLjctMy4xLTQuMnMyLjctMS45LDQuOS0xUzYyLjcsNDAuNyw2Mi4yLDQyLjF6Ii8+PHBhdGggY2xhc3M9InN0MiIgZD0iTTc0LjMsNDIuMWMtMC41LDEuNC0yLjcsMS45LTQuOSwxYy0yLjItMC45LTMuNi0yLjctMy4xLTQuMnMyLjctMS45LDQuOS0xUzc0LjgsNDAuNyw3NC4zLDQyLjF6Ii8+PHBhdGggY2xhc3M9InN0MiIgZD0iTTgyLDM2LjhjLTAuNSwxLjQtMi43LDEuOS00LjksMWMtMi4yLTAuOS0zLjYtMi43LTMuMS00LjJjMC41LTEuNCwyLjctMS45LDQuOS0xQzgxLjEsMzMuNiw4Mi41LDM1LjQsODIsMzYuOHoiLz48L3N2Zz4=',

            'daydreamControl': 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwIDEyNSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTAwIDEyNTsiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+LnN0MHtmaWxsOiMyODI4Mjg7fS5zdDF7ZmlsbDojQTBBMEEwO308L3N0eWxlPjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik01MC42LDExOWgtMC4yYy0xMC4xLDAtMTguNC04LjMtMTguNC0xOC40VjI2LjRDMzIsMTYuMyw0MC4zLDgsNTAuNCw4aDBDNjAuNiw4LDY5LDE2LjQsNjksMjYuNnY3NEM2OSwxMTAuNyw2MC43LDExOSw1MC42LDExOXoiLz48ZWxsaXBzZSBjbGFzcz0ic3QxIiBjeD0iNTAuNyIgY3k9Ijc5LjkiIHJ4PSI4LjQiIHJ5PSI4LjUiLz48ZWxsaXBzZSBjbGFzcz0ic3QxIiBjeD0iNTAuOCIgY3k9IjU4IiByeD0iOC40IiByeT0iOC41Ii8+PGVsbGlwc2UgY2xhc3M9InN0MSIgY3g9IjUwLjQiIGN5PSIyNy41IiByeD0iMTYuMSIgcnk9IjE2Ii8+PC9zdmc+',

            // Created by Arthur Shlain of the Noun Project.

            'gamepadControl': 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwIDEyNSIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTAwIDEwMCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHBhdGggZmlsbD0iIzAwMDAwMCIgZD0iTTg3LjMsMzcuM2MtMS4xLTctNy4xLTEyLjMtMTQuNC0xMi4zYy00LDAtNy42LDEuNi0xMC4yLDQuMkgzNy4zYy0yLjYtMi42LTYuMi00LjItMTAuMi00LjIgIGMtNy4zLDAtMTMuMyw1LjQtMTQuNCwxMi4zYy0wLjUsMi40LTQuNCwyOC00LjQsMjkuM2MwLDQuNiwzLjcsOC4zLDguMyw4LjNjMy4xLDAsNS43LTEuNyw3LjItNC4xYzEuMy0xLjgsNi4yLTkuMyw3LjUtMTEuMiAgYzEuNSwxLjcsMy43LDIuOSw2LjIsMi45YzQuNiwwLDguMy0zLjcsOC4zLTguM2g4LjNjMCw0LjYsMy43LDguMyw4LjMsOC4zYzIuNSwwLDQuNy0xLjEsNi4yLTIuOWMxLjIsMS45LDYuMSw5LjUsNy41LDExLjIgIGMxLjUsMi41LDQuMSw0LjEsNy4yLDQuMWM0LjYsMCw4LjMtMy43LDguMy04LjNDOTEuNyw2Ni4xLDg3LjgsMzkuNSw4Ny4zLDM3LjNDODYuMiwzMC40LDg3LjgsMzkuNSw4Ny4zLDM3LjN6IE0yOS4yLDQxLjd2NC4ySDI1ICB2LTQuMmgtNC4ydi00LjJIMjV2LTQuMmg0LjJ2NC4yaDQuMnY0LjJIMjkuMnogTTM3LjUsNTguM2MtMi4zLDAtNC4yLTEuOS00LjItNC4yYzAtMi4zLDEuOS00LjIsNC4yLTQuMnM0LjIsMS45LDQuMiw0LjIgIEM0MS43LDU2LjUsMzkuOCw1OC4zLDM3LjUsNTguM3ogTTcyLjksMzAuMmMxLjcsMCwzLjEsMS40LDMuMSwzLjFjMCwxLjctMS40LDMuMS0zLjEsMy4xcy0zLjEtMS40LTMuMS0zLjEgIEM2OS44LDMxLjYsNzEuMiwzMC4yLDcyLjksMzAuMnogTTYyLjUsNTguM2MtMi4zLDAtNC4yLTEuOS00LjItNC4yYzAtMi4zLDEuOS00LjIsNC4yLTQuMnM0LjIsMS45LDQuMiw0LjIgIEM2Ni43LDU2LjUsNjQuOCw1OC4zLDYyLjUsNTguM3ogTTY2LjcsNDIuN2MtMS43LDAtMy4xLTEuNC0zLjEtMy4xYzAtMS43LDEuNC0zLjEsMy4xLTMuMXMzLjEsMS40LDMuMSwzLjEgIEM2OS44LDQxLjMsNjguNCw0Mi43LDY2LjcsNDIuN3ogTTcyLjksNDljLTEuNywwLTMuMS0xLjQtMy4xLTMuMWMwLTEuNywxLjQtMy4xLDMuMS0zLjFzMy4xLDEuNCwzLjEsMy4xQzc2LDQ3LjYsNzQuNiw0OSw3Mi45LDQ5eiAgIE03OS4yLDQyLjdjLTEuNywwLTMuMS0xLjQtMy4xLTMuMWMwLTEuNywxLjQtMy4xLDMuMS0zLjFzMy4xLDEuNCwzLjEsMy4xQzgyLjMsNDEuMyw4MC45LDQyLjcsNzkuMiw0Mi43eiIvPjx0ZXh0IHg9IjAiIHk9IjExNSIgZmlsbD0iIzAwMDAwMCIgZm9udC1zaXplPSI1cHgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LWZhbWlseT0iJ0hlbHZldGljYSBOZXVlJywgSGVsdmV0aWNhLCBBcmlhbC1Vbmljb2RlLCBBcmlhbCwgU2Fucy1zZXJpZiI+Q3JlYXRlZCBieSBBcnRodXIgU2hsYWluPC90ZXh0Pjx0ZXh0IHg9IjAiIHk9IjEyMCIgZmlsbD0iIzAwMDAwMCIgZm9udC1zaXplPSI1cHgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmb250LWZhbWlseT0iJ0hlbHZldGljYSBOZXVlJywgSGVsdmV0aWNhLCBBcmlhbC1Vbmljb2RlLCBBcmlhbCwgU2Fucy1zZXJpZiI+ZnJvbSB0aGUgTm91biBQcm9qZWN0PC90ZXh0Pjwvc3ZnPg==',

            // Created by Garrett Knoll of the Noun Project.

            fullscreen: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwIDEyNSIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTAwIDEwMCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+PGc+PHBhdGggZmlsbD0iIzAwMDAwMCIgZD0iTTc3LjE3MSw3OS44ODdINjEuODE0Yy0xLjUsMC0yLjcxNS0xLjIxNi0yLjcxNS0yLjcxNWMwLTEuNSwxLjIxNi0yLjcxNSwyLjcxNS0yLjcxNWgxMi42NDJWNjEuODE1ICAgIGMwLTEuNSwxLjIxNi0yLjcxNSwyLjcxNS0yLjcxNXMyLjcxNSwxLjIxNiwyLjcxNSwyLjcxNXYxNS4zNTdDNzkuODg3LDc4LjY3MSw3OC42NzEsNzkuODg3LDc3LjE3MSw3OS44ODd6Ii8+PC9nPjxnPjxwYXRoIGZpbGw9IiMwMDAwMDAiIGQ9Ik0zOC4yNTQsNzkuODg3SDIyLjg5N2MtMS41LDAtMi43MTUtMS4yMTYtMi43MTUtMi43MTVWNjEuODE1YzAtMS41LDEuMjE2LTIuNzE1LDIuNzE1LTIuNzE1ICAgIHMyLjcxNSwxLjIxNiwyLjcxNSwyLjcxNXYxMi42NDFoMTIuNjQyYzEuNSwwLDIuNzE1LDEuMjE2LDIuNzE1LDIuNzE1QzQwLjk2OSw3OC42NzEsMzkuNzU0LDc5Ljg4NywzOC4yNTQsNzkuODg3eiIvPjwvZz48L2c+PGc+PGc+PHBhdGggZmlsbD0iIzAwMDAwMCIgZD0iTTIyLjg5Nyw0MC45N2MtMS41LDAtMi43MTUtMS4yMTYtMi43MTUtMi43MTVWMjIuODk4YzAtMS41LDEuMjE2LTIuNzE1LDIuNzE1LTIuNzE1aDE1LjM1NyAgICBjMS41LDAsMi43MTUsMS4yMTYsMi43MTUsMi43MTVzLTEuMjE2LDIuNzE1LTIuNzE1LDIuNzE1SDI1LjYxMnYxMi42NDFDMjUuNjEyLDM5Ljc1NSwyNC4zOTcsNDAuOTcsMjIuODk3LDQwLjk3eiIvPjwvZz48Zz48cGF0aCBmaWxsPSIjMDAwMDAwIiBkPSJNNzcuMTcxLDQwLjk3Yy0xLjUsMC0yLjcxNS0xLjIxNi0yLjcxNS0yLjcxNVYyNS42MTNINjEuODE0Yy0xLjUsMC0yLjcxNS0xLjIxNi0yLjcxNS0yLjcxNSAgICBzMS4yMTYtMi43MTUsMi43MTUtMi43MTVoMTUuMzU3YzEuNSwwLDIuNzE1LDEuMjE2LDIuNzE1LDIuNzE1djE1LjM1N0M3OS44ODcsMzkuNzU1LDc4LjY3MSw0MC45Nyw3Ny4xNzEsNDAuOTd6Ii8+PC9nPjwvZz48Zz48cGF0aCBmaWxsPSIjMDAwMDAwIiBkPSJNOTIuMjg1LDk1SDcuNzE1QzYuMjE2LDk1LDUsOTMuNzg1LDUsOTIuMjg1VjcuNzE2QzUsNi4yMTYsNi4yMTYsNSw3LjcxNSw1aDg0LjU2OSAgIEM5My43ODQsNSw5NSw2LjIxNiw5NSw3LjcxNnY4NC41NjlDOTUsOTMuNzg1LDkzLjc4NCw5NSw5Mi4yODUsOTV6IE0xMC40MzEsODkuNTY5aDc5LjEzOFYxMC40MzFIMTAuNDMxVjg5LjU2OXoiLz48L2c+PC9zdmc+',

            // Added strikethrough.

            inactiveFullscreen: 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwIDEyNSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTAwIDEyNTsiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+LnN0MHtmaWxsOiM2MDYwNjA7fS5zdDF7ZmlsbDpub25lO3N0cm9rZTojRkY3MzczO3N0cm9rZS13aWR0aDozO3N0cm9rZS1taXRlcmxpbWl0OjEwO308L3N0eWxlPjxnPjxnPjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik03Ny4yLDc5LjlINjEuOGMtMS41LDAtMi43LTEuMi0yLjctMi43YzAtMS41LDEuMi0yLjcsMi43LTIuN2gxMi42VjYxLjhjMC0xLjUsMS4yLTIuNywyLjctMi43czIuNywxLjIsMi43LDIuN3YxNS40Qzc5LjksNzguNyw3OC43LDc5LjksNzcuMiw3OS45eiIvPjwvZz48Zz48cGF0aCBjbGFzcz0ic3QwIiBkPSJNMzguMyw3OS45SDIyLjljLTEuNSwwLTIuNy0xLjItMi43LTIuN1Y2MS44YzAtMS41LDEuMi0yLjcsMi43LTIuN3MyLjcsMS4yLDIuNywyLjd2MTIuNmgxMi42YzEuNSwwLDIuNywxLjIsMi43LDIuN0M0MSw3OC43LDM5LjgsNzkuOSwzOC4zLDc5Ljl6Ii8+PC9nPjwvZz48Zz48Zz48cGF0aCBjbGFzcz0ic3QwIiBkPSJNMjIuOSw0MWMtMS41LDAtMi43LTEuMi0yLjctMi43VjIyLjljMC0xLjUsMS4yLTIuNywyLjctMi43aDE1LjRjMS41LDAsMi43LDEuMiwyLjcsMi43cy0xLjIsMi43LTIuNywyLjdIMjUuNnYxMi42QzI1LjYsMzkuOCwyNC40LDQxLDIyLjksNDF6Ii8+PC9nPjxnPjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik03Ny4yLDQxYy0xLjUsMC0yLjctMS4yLTIuNy0yLjdWMjUuNkg2MS44Yy0xLjUsMC0yLjctMS4yLTIuNy0yLjdzMS4yLTIuNywyLjctMi43aDE1LjRjMS41LDAsMi43LDEuMiwyLjcsMi43djE1LjRDNzkuOSwzOS44LDc4LjcsNDEsNzcuMiw0MXoiLz48L2c+PC9nPjxnPjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik05Mi4zLDk1SDcuN0M2LjIsOTUsNSw5My44LDUsOTIuM1Y3LjdDNSw2LjIsNi4yLDUsNy43LDVoODQuNkM5My44LDUsOTUsNi4yLDk1LDcuN3Y4NC42Qzk1LDkzLjgsOTMuOCw5NSw5Mi4zLDk1eiBNMTAuNCw4OS42aDc5LjFWMTAuNEgxMC40Vjg5LjZ6Ii8+PC9nPjxsaW5lIGNsYXNzPSJzdDEiIHgxPSIxMDAiIHkxPSIwIiB4Mj0iNSIgeTI9IjEwNiIvPjwvc3ZnPg==',

            // Created by Shawn Erdely of the Noun Project.

            gear: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwIDEyNSIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTAwIDEwMCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHBhdGggZD0iTTU5LjQsNWMwLjQsMy4xLDAuOSw2LjEsMS4zLDkuMWMwLDAuMywwLDAuNSwwLjEsMC44YzAuMywxLDUuMywyLjcsNi4yLDJjMi4yLTEuNiw0LjQtMy4yLDYuNS00LjljMC44LTAuNywxLjQtMC41LDIuMSwwICBjNC44LDMuMyw4LjgsNy40LDEyLjEsMTIuMmMwLjUsMC43LDAuNSwxLjIsMCwxLjljLTEuNywyLjEtMy4zLDQuNC00LjksNi41Yy0wLjUsMC43LTAuNywxLjMtMC4yLDIuMWMwLjMsMC41LDAuNiwxLDAuNywxLjUgIGMwLjQsMi4zLDEuOCwzLDMuOSwzLjFjMi4xLDAuMSw0LjIsMC42LDYuMiwwLjhjMC45LDAuMSwxLjIsMC40LDEuNCwxLjJjMC44LDQuMiwxLDguNSwwLjYsMTIuN2MtMC4xLDEuNi0wLjQsMy4zLTAuNyw0LjkgIGMtMC4xLDAuNC0wLjYsMC45LTEsMWMtMi43LDAuNS01LjUsMC45LTguMiwxLjJjLTAuOSwwLjEtMS40LDAuNC0xLjYsMS4zYy0wLjEsMC41LTAuMywxLjEtMC42LDEuNmMtMS40LDEuOS0wLjgsMy41LDAuNyw1LjEgIGMxLjQsMS42LDIuNiwzLjMsMy44LDVjMC4zLDAuNCwwLjMsMS4zLDAuMSwxLjdjLTMuMyw0LjktNy40LDktMTIuMywxMi40Yy0wLjcsMC41LTEuMiwwLjQtMS45LTAuMWMtMi4xLTEuNy00LjQtMy4zLTYuNS00LjkgIGMtMC42LTAuNS0xLjItMC43LTEuOS0wLjJjLTAuNSwwLjMtMS4xLDAuNi0xLjcsMC43Yy0yLjMsMC40LTIuOSwxLjktMyw0Yy0wLjEsMi4xLTAuNSw0LjMtMC45LDYuNGMtMC4xLDAuNC0wLjYsMS0xLjEsMS4xICBjLTUuOSwxLjItMTEuNywxLjItMTcuNiwwLjFjLTAuOC0wLjEtMS4xLTAuNS0xLjItMS4zYy0wLjMtMi43LTAuOC01LjQtMS4xLTguMWMtMC4xLTAuOS0wLjQtMS40LTEuMy0xLjZjLTAuNC0wLjEtMC45LTAuMy0xLjMtMC41ICBjLTItMS40LTMuNy0xLTUuNSwwLjdjLTEuNCwxLjQtMy4yLDIuNC00LjgsMy43Yy0wLjcsMC42LTEuMiwwLjYtMS45LDAuMWMtNC45LTMuNC05LTcuNS0xMi40LTEyLjRjLTAuNS0wLjctMC40LTEuMiwwLjEtMS45ICBjMS43LTIuMSwzLjMtNC40LDQuOS02LjVjMC41LTAuNiwwLjctMS4yLDAuMi0xLjljLTAuMy0wLjQtMC42LTAuOS0wLjYtMS40Yy0wLjQtMi43LTIuMi0zLjItNC42LTMuNGMtMi0wLjEtNC0wLjUtNS45LTAuOSAgYy0wLjQtMC4xLTEtMC43LTEuMS0xLjFjLTEuMi01LjktMS4yLTExLjcsMC0xNy42YzAuMS0wLjQsMC43LTEsMS4xLTFjMi44LTAuNSw1LjYtMC44LDguNC0xLjNjMC41LTAuMSwwLjktMC42LDEuMy0xICBjMC4xLTAuMSwwLjEtMC40LDAuMi0wLjZjMi0yLjgsMS4yLTUuMi0xLTcuNWMtMS4xLTEuMi0yLjEtMi42LTMtMy45Yy0wLjMtMC40LTAuMy0xLjItMC4xLTEuNmMzLjMtNSw3LjUtOS4xLDEyLjQtMTIuNSAgYzAuNy0wLjUsMS4xLTAuNCwxLjcsMC4xYzIuMSwxLjcsNC40LDMuMyw2LjUsNC45YzAuNywwLjUsMS4zLDAuNywyLDAuMmMwLjUtMC4zLDEuMS0wLjYsMS43LTAuN2MyLjMtMC40LDIuOC0xLjksMi45LTMuOSAgYzAuMS0yLjEsMC42LTQuMiwwLjgtNi4zYzAuMS0xLDAuNS0xLjMsMS40LTEuNEM0Ny4xLDMuNyw1My4yLDMuNyw1OS40LDV6IE0zMi42LDQ5LjZjLTAuMSw5LjMsNy41LDE2LjgsMTYuOCwxNi45ICBjOS4yLDAsMTYuOS03LjYsMTYuOS0xNi44YzAtOS4yLTcuNi0xNi43LTE2LjgtMTYuOEM0MC4yLDMyLjgsMzIuNiw0MC4zLDMyLjYsNDkuNnoiLz48dGV4dCB4PSIwIiB5PSIxMTUiIGZpbGw9IiMwMDAwMDAiIGZvbnQtc2l6ZT0iNXB4IiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1mYW1pbHk9IidIZWx2ZXRpY2EgTmV1ZScsIEhlbHZldGljYSwgQXJpYWwtVW5pY29kZSwgQXJpYWwsIFNhbnMtc2VyaWYiPkNyZWF0ZWQgYnkgU2hhd24gRXJkZWx5IDwvdGV4dD48dGV4dCB4PSIwIiB5PSIxMjAiIGZpbGw9IiMwMDAwMDAiIGZvbnQtc2l6ZT0iNXB4IiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1mYW1pbHk9IidIZWx2ZXRpY2EgTmV1ZScsIEhlbHZldGljYSwgQXJpYWwtVW5pY29kZSwgQXJpYWwsIFNhbnMtc2VyaWYiPmZyb20gdGhlIE5vdW4gUHJvamVjdDwvdGV4dD48L3N2Zz4=',

            // Added strikethrough.

            inactiveGear: 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDEwMCAxMjUiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDEwMCAxMjU7IiB4bWw6c3BhY2U9InByZXNlcnZlIj48c3R5bGUgdHlwZT0idGV4dC9jc3MiPi5zdDB7ZmlsbDojNjA2MDYwO30uc3Qxe2ZpbGw6bm9uZTtzdHJva2U6I0ZGNzM3MztzdHJva2Utd2lkdGg6MztzdHJva2UtbWl0ZXJsaW1pdDoxMDt9PC9zdHlsZT48cGF0aCBjbGFzcz0ic3QwIiBkPSJNNTkuNCw1YzAuNCwzLjEsMC45LDYuMSwxLjMsOS4xYzAsMC4zLDAsMC41LDAuMSwwLjhjMC4zLDEsNS4zLDIuNyw2LjIsMmMyLjItMS42LDQuNC0zLjIsNi41LTQuOWMwLjgtMC43LDEuNC0wLjUsMi4xLDBjNC44LDMuMyw4LjgsNy40LDEyLjEsMTIuMmMwLjUsMC43LDAuNSwxLjIsMCwxLjljLTEuNywyLjEtMy4zLDQuNC00LjksNi41Yy0wLjUsMC43LTAuNywxLjMtMC4yLDIuMWMwLjMsMC41LDAuNiwxLDAuNywxLjVjMC40LDIuMywxLjgsMywzLjksMy4xczQuMiwwLjYsNi4yLDAuOGMwLjksMC4xLDEuMiwwLjQsMS40LDEuMmMwLjgsNC4yLDEsOC41LDAuNiwxMi43Yy0wLjEsMS42LTAuNCwzLjMtMC43LDQuOWMtMC4xLDAuNC0wLjYsMC45LTEsMWMtMi43LDAuNS01LjUsMC45LTguMiwxLjJjLTAuOSwwLjEtMS40LDAuNC0xLjYsMS4zYy0wLjEsMC41LTAuMywxLjEtMC42LDEuNmMtMS40LDEuOS0wLjgsMy41LDAuNyw1LjFjMS40LDEuNiwyLjYsMy4zLDMuOCw1YzAuMywwLjQsMC4zLDEuMywwLjEsMS43Yy0zLjMsNC45LTcuNCw5LTEyLjMsMTIuNGMtMC43LDAuNS0xLjIsMC40LTEuOS0wLjFjLTIuMS0xLjctNC40LTMuMy02LjUtNC45Yy0wLjYtMC41LTEuMi0wLjctMS45LTAuMmMtMC41LDAuMy0xLjEsMC42LTEuNywwLjdjLTIuMywwLjQtMi45LDEuOS0zLDRzLTAuNSw0LjMtMC45LDYuNGMtMC4xLDAuNC0wLjYsMS0xLjEsMS4xYy01LjksMS4yLTExLjcsMS4yLTE3LjYsMC4xYy0wLjgtMC4xLTEuMS0wLjUtMS4yLTEuM2MtMC4zLTIuNy0wLjgtNS40LTEuMS04LjFjLTAuMS0wLjktMC40LTEuNC0xLjMtMS42Yy0wLjQtMC4xLTAuOS0wLjMtMS4zLTAuNWMtMi0xLjQtMy43LTEtNS41LDAuN2MtMS40LDEuNC0zLjIsMi40LTQuOCwzLjdjLTAuNywwLjYtMS4yLDAuNi0xLjksMC4xYy00LjktMy40LTktNy41LTEyLjQtMTIuNGMtMC41LTAuNy0wLjQtMS4yLDAuMS0xLjljMS43LTIuMSwzLjMtNC40LDQuOS02LjVjMC41LTAuNiwwLjctMS4yLDAuMi0xLjljLTAuMy0wLjQtMC42LTAuOS0wLjYtMS40Yy0wLjQtMi43LTIuMi0zLjItNC42LTMuNGMtMi0wLjEtNC0wLjUtNS45LTAuOWMtMC40LTAuMS0xLTAuNy0xLjEtMS4xYy0xLjItNS45LTEuMi0xMS43LDAtMTcuNmMwLjEtMC40LDAuNy0xLDEuMS0xYzIuOC0wLjUsNS42LTAuOCw4LjQtMS4zYzAuNS0wLjEsMC45LTAuNiwxLjMtMWMwLjEtMC4xLDAuMS0wLjQsMC4yLTAuNmMyLTIuOCwxLjItNS4yLTEtNy41Yy0xLjEtMS4yLTIuMS0yLjYtMy0zLjljLTAuMy0wLjQtMC4zLTEuMi0wLjEtMS42YzMuMy01LDcuNS05LjEsMTIuNC0xMi41YzAuNy0wLjUsMS4xLTAuNCwxLjcsMC4xYzIuMSwxLjcsNC40LDMuMyw2LjUsNC45YzAuNywwLjUsMS4zLDAuNywyLDAuMmMwLjUtMC4zLDEuMS0wLjYsMS43LTAuN2MyLjMtMC40LDIuOC0xLjksMi45LTMuOWMwLjEtMi4xLDAuNi00LjIsMC44LTYuM2MwLjEtMSwwLjUtMS4zLDEuNC0xLjRDNDcuMSwzLjcsNTMuMiwzLjcsNTkuNCw1eiBNMzIuNiw0OS42Yy0wLjEsOS4zLDcuNSwxNi44LDE2LjgsMTYuOWM5LjIsMCwxNi45LTcuNiwxNi45LTE2LjhTNTguNywzMyw0OS41LDMyLjlDNDAuMiwzMi44LDMyLjYsNDAuMywzMi42LDQ5LjZ6Ii8+PGxpbmUgY2xhc3M9InN0MSIgeDE9Ijk1LjYiIHkxPSI0IiB4Mj0iMTEiIHkyPSIxMTIiLz48L3N2Zz4=',

            // Created by Guilhem of the Noun Project.

            backArrow: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwIDEyNSIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTAwIDEwMCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+PGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJiZXZlbCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiB4MT0iOTMuMSIgeTE9IjUwIiB4Mj0iNi45IiB5Mj0iNTAiLz48bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49ImJldmVsIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHgxPSI2LjkiIHkxPSI1MCIgeDI9IjMyLjciIHkyPSI3NS45Ii8+PGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJiZXZlbCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiB4MT0iNi45IiB5MT0iNTAiIHgyPSIzMi43IiB5Mj0iMjQuMSIvPjwvZz48L3N2Zz4=',

            // Added strikethrough.

            inactiveBackArrow: 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwIDEyNSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTAwIDEyNTsiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+LnN0MHtmaWxsOm5vbmU7c3Ryb2tlOiMwMDAwMDA7c3Ryb2tlLXdpZHRoOjM7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOmJldmVsO3N0cm9rZS1taXRlcmxpbWl0OjEwO30uc3Qxe2ZpbGw6bm9uZTtzdHJva2U6I0ZGNzM3MztzdHJva2Utd2lkdGg6MztzdHJva2UtbWl0ZXJsaW1pdDoxMDt9PC9zdHlsZT48Zz48bGluZSBjbGFzcz0ic3QwIiB4MT0iOTMuMSIgeTE9IjUwIiB4Mj0iNi45IiB5Mj0iNTAiLz48bGluZSBjbGFzcz0ic3QwIiB4MT0iNi45IiB5MT0iNTAiIHgyPSIzMi43IiB5Mj0iNzUuOSIvPjxsaW5lIGNsYXNzPSJzdDAiIHgxPSI2LjkiIHkxPSI1MCIgeDI9IjMyLjciIHkyPSIyNC4xIi8+PC9nPjxsaW5lIGNsYXNzPSJzdDEiIHgxPSI4OSIgeTE9IjEzIiB4Mj0iMjQiIHkyPSI5NiIvPjwvc3ZnPg=='

        };

        this.controls = [],

        this.util = util,

        this.webgl = webgl,

        this.webvr = webvr;

        this.vrButton = null,

        this.fullscreenButton = null,

        this.poseButton = null,

        this.exitFullscreenButton = null,

        this.exitVRButton = null;

        // EventHandler ES6 kludges. Rebind handlers so we can use removeEventListener.

        this.vrHandleKeys = this.vrHandleKeys.bind( this );

        // save old DOM style

        if ( init ) {

           this.init( this.UI_DOM );

        }

    }

    init ( uiMode ) {

        if ( ! uiMode ) {

            console.log( 'no mode provided, setting default' );

            uiMode = this.mode;

        }

        // Listen to fullscreen change events.

        document.addEventListener( 'webkitfullscreenchange', this.fullscreenChange.bind( this ), false );

        document.addEventListener( 'mozfullscreenchange', this.fullscreenChange.bind( this ), false );

        document.addEventListener( 'msfullscreenchange', this.fullscreenChange.bind( this ), false );

        this.createUi(); // starting configuration

    }

    /* 
     * =============== Ui SETUP AND CONFIGURATION ====================
     */

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
     * Create the default DOM ui.
     */
    createUi () {

        console.log( 'entering DOMUi')

        let c = this.webgl.getCanvas(),

        p = c.parentNode;

        // c.parentNode should be a <div> that gets ALL the DOM styling. Don't touch <canvas>.

        // TODO: set local style of <canvas> to width=100%, height = 100%

        // TODO: test with fullscreen <canvas> style (attached to document.body)

        // Set some local styles overriding any conflicting styles for parentNode.

        p.style.margin = '0';

        p.style.border = '0';

        p.style.padding = '0';

        // Check for control HTML markup.

        let controls = c.parentNode.querySelector( '.webvr-mini-controls' );

        if ( ! controls ) {

            controls = document.createElement( 'nav' );

        }

        if ( c ) {

            // WebVR object methods to connect.

            let vr = this.webvr;

            console.log( 'creating DOM Ui');

            this.controls = controls; // save a shadow reference

            // VR button

            let vrButton = this.createButton();

            vrButton.style.top = '0px';

            vrButton.style.left = '0px';

            vrButton.zIndex = '9999',

            vrButton.activeSrc = this.icons.vr;

            vrButton.inactiveSrc = this.icons.inactiveVR;

            if ( vr.hasWebVR() ) {

                vrButton.activate();

            } else {

                vrButton.inactivate();

            }

            vrButton.show();

            this.vrButton = vrButton;

            this.controls.vrButton = vrButton;

            /* 
             * Set the emitter (pseudo-event 'vrdisplay'). If the 
             * device is recognized, use a custom icon. If there is a lag, 
             * the inactive generic VR icon will be visible until the device initializess.
             */

            this.util.emitter.on( 'vrdisplayready', 

                ( deviceName ) => {

                    let dName = deviceName.toLowerCase();

                    if ( deviceName ) {

                        if ( dName.indexOf( 'vive') !== this.util.NOT_IN_LIST ) {

                            vrButton.src = vrButton.activeSrc = this.icons.htcvive;

                            if ( dName.indexOf( 'emulat' ) !== this.util.NOT_IN_LIST ) {

                                vrButton.emulated( this.icons.emulated );

                            }

                        } else if ( dName.indexOf( 'oculus' ) !== this.util.NOT_IN_LIST ) {

                            vrButton.src = vrButton.activeSrc = this.icons.oculusrift;

                        }

                    }

                    vrButton.activate();

                } );

            // Fullscreen

            let fullscreenButton = this.createButton();

            fullscreenButton.style.top = '4px';

            fullscreenButton.style.left = '60px';

            // Shrink this icon a bit TODO: !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

            fullscreenButton.style.width = '32px';

            fullscreenButton.style.height = '32px';

            fullscreenButton.activeSrc = this.icons.fullscreen;

            fullscreenButton.inactiveSrc = this.icons.inactiveFullscreen;

            if ( this.hasFullscreen() ) { 

                fullscreenButton.activate();

            } else {

                fullscreenButton.inactivate();

            }

            fullscreenButton.show();

            // Attach DOM element directly, and via controls DOM element;

            this.fullscreenButton = fullscreenButton;

            this.controls.fullscreenButton = fullscreenButton;

            // Fullscreen return button.

            let exitFullscreenButton = this.createButton();

            exitFullscreenButton.style.top = '0px';

            exitFullscreenButton.style.left = '0px';

            exitFullscreenButton.zIndex = '9999',

            exitFullscreenButton.activeSrc = this.icons.backArrow;

            exitFullscreenButton.inactiveSrc = this.icons.inactiveBackArrow;

            if ( this.hasFullscreen() ) {

                exitFullscreenButton.activate();

            } else {

               exitFullscreenButton.inactivate();

            }

            exitFullscreenButton.hide();

            this.exitFullscreenButton = exitFullscreenButton;

            this.controls.exitFullscreenButton = exitFullscreenButton;

            // VR return button.

            let exitVRButton = this.createButton();

            exitVRButton.style.top = '0px';

            exitVRButton.style.left = '0px';

            exitVRButton.zIndex = '9999',

            exitVRButton.activeSrc = this.icons.backArrow;

            exitVRButton.inactiveSrc = this.icons.inactiveBackArrow;

            if ( vr.hasWebVR() ) {

                exitVRButton.activate();

            } else {

                exitVRButton.inactivate();

            }

            exitVRButton.hide();

            this.exitVRButton = exitVRButton; // save reference

            this.controls.exitVRButton = exitVRButton; // group under controls

            // Bind our pseudo-event to activating the button (so it waits for the webvr display).

            this.util.emitter.on( 'vrdisplayready', exitVRButton.activate );

            // Add event listeners.

            // Go to VR mode.

            vrButton.addEventListener( 'click' , ( evt ) => {

                console.log( 'clicked vr button...' );

                evt.preventDefault();

                this.vrButton.hide();

                this.fullscreenButton.hide();

                this.exitVRButton.show();

                // Set the mode (DOM -> WebVR stereo).

                this.mode = this.UI_VR;

                this.fullscreenChange( evt );

                // Add a keydown event to make VR entry and exit like fullscreen.

                addEventListener( 'keydown', this.vrHandleKeys ); ////////////////////////////////////////////////////////////////////

                // Request VR presentation.

                // NOTE: THIS MAY TAKE A FEW SECONDS, PROVIDE A SPINNER

                vr.requestPresent();

            } );

            // Go to fullscreen mode.

            fullscreenButton.addEventListener( 'click', ( evt ) => {

                console.log( 'clicked fullscreen button...' );

                evt.preventDefault();

                const f = Math.max( window.devicePixelRatio, 1 );

                // Get the current size of the parent.

                this.oldWidth  = p.clientWidth  * f | 0;

                this.oldHeight = p.clientHeight * f | 0;

                // Set style of enclosing element <div><canvas><</div> to screen size.

                p.style.width = this.util.getScreenWidth() + 'px';

                p.style.height = this.util.getScreenHeight() + 'px';

                // Set the mode (DOM -> Fullscreen)

                this.mode = this.UI_DOM;

                // Use global reference.

                //this.vrButton.hide();
                //this.fullscreenButton.hide();
                //this.exitFullscreenButton.show();

                // Fire the fullscreen command.

                this.requestFullscreen();

            } );

            // Return from fullscreen button listener.

            exitFullscreenButton.addEventListener( 'click' , ( evt ) => {

                console.log( 'clicked exit fullscreen button...' );

                // TODO: exit fullscreen and/or VR.

                evt.preventDefault();

                //this.exitFullscreenButton.hide();
                //this.vrButton.show();
                //this.fullscreenButton.show();

                // Fire the exit fullscreen event (also triggered by escape key).

                this.exitFullscreen();

            } );

            // Return from VR button listener.

            exitVRButton.addEventListener( 'click', ( evt ) => {

                console.log( 'clicked exit vr button' );

                evt.preventDefault();

                this.exitVRButton.hide();

                this.vrButton.show();

                this.fullscreenButton.show();

                // Call webvr presentation exit (which may fail).

                vr.exitPresent( () => { 

                    removeEventListener( 'keydown', this.vrHandleEsc );

                    this.setControlsByMode( this.UI_DOM ) 

                    }

                );

            } );

            // Reset pose button

            controls.appendChild( vrButton );

            controls.appendChild( fullscreenButton );

            controls.appendChild( exitFullscreenButton );

            controls.appendChild( exitVRButton );

        } else {

            console.error( 'Ui::createDOMUi(): canvas not defined' );

        }

    }

    /* 
     * =============== KEYDOWN EVENTS ====================
     */

    /** 
     * Add an escape key handler for entry into VR, similar to fullscreen. 
     * 
      * NOTE: we bind this 
     * sucker to itself(!) in the constructor, so that we can supply addEventListener with a named function, 
     * and remove it later. Otherwise, you can't remove handlers bound with addEventListener.
     */
    vrHandleKeys ( evt ) {

        switch ( evt.keyCode) {

            case 27: // ESC key

                console.log("AN ESCAPE");

                this.mode = this.UI_DOM;

                // this.webvr.exitPresent handles some of the resizing, we have to restore the Uis


                // exit VR presentation

                this.webvr.exitPresent();

                break;

            default:

                break;

        }

    }

    /* 
     * =============== FULLSCREEN EVENTS ====================
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
     * Cross-browser enter fullscreen mode. NOTE: this is called by an 
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

        if ( document.exitFullscreen ) {

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
     * NOTE: used .bind() to bind to this object.s
     */
    fullscreenChange ( evt ) {

        let c = this.webgl.getCanvas(),

        p = c.parentNode,

        gl = this.webgl.getContext();

        switch ( this.mode ) {

            case this.UI_VR:

                console.log( 'from vr to dom...' );

                //this.exitVRButton.show();
                //this.vrButton.hide();
                //this.fullscreenButton.hide();

                this.setControlsByMode( this.mode );

                break;

            case this.UI_FULLSCREEN:

                /* 
                 * Due to fullscreen API nastiness, you can't just call your standard resize() method
                 * and support the canvas jumping back to a DOM mode with CSS styles defined by an external 
                 * stylesheet. Additional resizing specific to exiting fullscreen has to be done here. 
                 * Removing the .style properties is particularly important.
                 *
                 * NOTE: UI_FULLSCREEN mode is actually from fullscreen to DOM.
                 * NOTE: UI_VR mode is from DOM to VR
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

                //this.exitFullscreenButton.hide();
                //this.vrButton.show();
                //this.fullscreenButton.show();

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

    /* 
     * =============== UI FACTORY FUNCTIONS ====================
     */

    /** 
     * Create a Ui button
     */
    createButton () {

        let button = document.createElement( 'img' );

        button.className = 'webvr-mini-button';

        let s = button.style;

        s.position = 'absolute',

        s.width = '36px',

        s.height = '36px',

        s.backgroundSize = 'cover',

        s.backgroundColor = 'transparent',

        s.border = 0,

        s.userSelect = 'none',

        s.webkitUserSelect = 'none',

        s.MozUserSelect = 'none',

        s.cursor = 'pointer',

        s.padding = '12px',

        s.zIndex = '10',

        s.display = 'none',

        s.boxSizing = 'content-box';

        // Prevent button from being selected and dragged.

        button.draggable = false;

        button.addEventListener( 'dragstart', ( evt ) => {

            evt.preventDefault();

        } );

        // Style it on hover.

        button.addEventListener( 'mouseenter', ( evt ) => {

            s.filter = s.webkitFilter = 'drop-shadow(0 0 6px rgba(255,255,255,1))';

        } );

        button.addEventListener( 'mouseleave', ( evt ) => {

            s.filter = s.webkitFilter = '';

        } );

        // Show the button onscreen.

        button.show = () => {

            button.style.display = 'inline-block';

        }

        // Hide the button onscreen.

        button.hide = () => {

            button.style.display = 'none';

        }

        // Add the emulated symbol underneath a given button.

        button.emulated = ( emuImg ) => {

            let emu = document.createElement( 'img' );

            emu.style.position = 'absolute';

            emu.style.width = '36px';

            emu.style.height = '56px';

            emu.style.top = '0';

            emu.style.left = button.style.left;

            emu.style.zIndex = '1';

            emu.style.display = 'inline-block';

            emu.src = emuImg;

            this.controls.appendChild( emu );

        }

        // Display and activate the button.

        button.activate = () => {

            button.src = button.activeSrc; // swap active symbol

        }

        // Display the button, but deactivate it.

        button.inactivate = () => {

            button.src = button.inactiveSrc; // swap inactive symbol

        }

        return button;

    }

}

// We put this here because of JSDoc(!).

export default Ui;