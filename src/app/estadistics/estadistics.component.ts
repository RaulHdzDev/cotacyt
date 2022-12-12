import { Component, OnInit } from '@angular/core';
import { ChartOptions, ChartType, ChartDataSets, plugins } from 'chart.js';
import plugin, * as pluginDataLabels from 'chartjs-plugin-datalabels';
import jsPDF from 'jspdf';
import { Color, defaultColors, Label } from 'ng2-charts';
import { EstadisticasService } from '../services/estadisticas.service';
import { UtilService } from '../services/util.service';


@Component({
  selector: 'app-estadistics-component',
  templateUrl: './estadistics.component.html',
  styleUrls: ['./estadistics.component.scss']
})
export class EstadisticsComponent implements OnInit {

  public barChartOptions: ChartOptions = {
    responsive: true,
    scales: { xAxes: [{}], yAxes: [
      {
        ticks: {
          beginAtZero: true
          }
      }] },
    plugins: {
      datalabels: {
        anchor: 'center',
        align: 'center',
        color: 'black',
      },
    }
  };
  public barChartColors: Color[] = [
    { backgroundColor: '#B58F78'},
  ];
  public barChartLabels: Label[] = ['El Mante', 'Madero', 'Matamoros', 'Nuevo Laredo', 'Reynosa', 'Victoria'];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [pluginDataLabels];
  public barChartData: ChartDataSets[];

  estadisticas:[];

  constructor(private estadisticasService: EstadisticasService, private utilService: UtilService) { }

  ngOnInit(): void {
    setTimeout(() => this.utilService._loading = true);
    setTimeout(() => this.utilService._loading = false, 4000);
    this.barChartData = [{
      data: [],
      label: 'Proyectos por sede'
    }];
    this.estadisticasService.getEstadisticasProyectosPorSede().subscribe(
      data => {
        this.estadisticas = data;
        const sede1 = data.estadisticas['El Mante'];
        const sede3 = data.estadisticas['Madero'];
        const sede4 = data.estadisticas['Matamoros'];
        const sede5 = data.estadisticas['Nuevo Laredo'];
        const sede6 = data.estadisticas['Reynosa'];
        const sede7 = data.estadisticas['Victoria'];
        this.barChartData = [{
          data: [sede1, sede3, sede4, sede5, sede6, sede7],
          label: 'Proyectos Por Sede'
        }];
      },
      err => {
        console.log(err);
      }
    );
  }

  // events
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }


  downloadPDF() {
    var canvas: any = document.getElementById('graficaProy1');
    //creates image
    var canvasImg = canvas.toDataURL("image/png", 1.0);
    //creates PDF from img
    var doc = new jsPDF('landscape');
    doc.setFontSize(20);
    doc.addImage('assets/cotacytResources/loginImages/logotamColor.png', 'png', 9, 7, 57, 28);
    doc.addImage('assets/cotacytResources/loginImages/cecit.png', 'png', 243, 5, 50, 40).setFont('Caviar').setFontSize(18).setTextColor('#646464');
    doc.text('Consejo Tamaulipeco de Ciencia y Tecnología', 91, 37);
    doc.addImage(canvasImg, 'JPEG', 15, 50, 260, 135 );
    doc.save('Proyectos-Por-Sede.pdf');
  }


}
