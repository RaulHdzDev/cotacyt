import { Component, OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import { Color, Label } from 'ng2-charts';
import { ChartType, ChartDataSets, ChartOptions } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { EstadisticasService } from '../../services/estadisticas.service';

@Component({
  selector: 'app-area',
  templateUrl: './area.component.html',
  styleUrls: ['./area.component.scss']
})
export class AreaComponent implements OnInit {

  public barChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      xAxes: [{}], yAxes: [
        {
          ticks: {
            beginAtZero: true
          }
        }]
    },
    plugins: {
      datalabels: {
        anchor: 'center',
        align: 'center',
        color: 'black'
      }
    }
  };

  public barChartColors: Color[] = [
    { backgroundColor: '#B58F78' },
  ];
  public barChartLabels: Label[] = ['Ciencias Exactas y Naturales',
  'Medicina y Salud',
  'Ciencias Sociales y Humanidades',
  'Computación y Software',
  'Ciencias de la Ingeniería',
  'Agropecuarias y Alimentos',
  'Divulgación de la Ciencia',
  'Medio Ambiente',
  'Mecatrónica',
  'Ciencias de los Materiales',
  'Biología'];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [pluginDataLabels];

  public barChartData: ChartDataSets[];
  asesores: [];
  constructor(private estadisticasService: EstadisticasService) { }

  ngOnInit() {
    this.barChartData = [{
      data: [],
      label: 'Proyectos por area'
    }];
    this.estadisticasService.getEstadisticasProyectosPorArea().subscribe(
      data => {
        this.asesores = data.estadisticas;
        const data1 = data.estadisticas['Ciencias Exactas y Naturales'];
        const data2 = data.estadisticas['Medicina y Salud'];
        const data3 = data.estadisticas['Ciencias Sociales y Humanidades'];
        const data4 = data.estadisticas['Computación y Software'];
        const data5 = data.estadisticas['Ciencias de la Ingeniería'];
        const data6 = data.estadisticas['Agropecuarias y Alimentos'];
        const data7 = data.estadisticas['Divulgación de la Ciencia'];
        const data8 = data.estadisticas['Medio Ambiente'];
        const data9 = data.estadisticas['Mecatrónica'];
        const data10 = data.estadisticas['Ciencias de los Materiales'];
        const data11 = data.estadisticas['Biología'];

        this.barChartData = [{
          data: [data1, data2, data3, data4, data5, data6, data7, data8, data9, data10, data11],
          label: 'Proyectos por area'
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
    const canvas: any = document.getElementById('graArea');
    // creates image
    const canvasImg = canvas.toDataURL('image/png', 1.0);

    // creates PDF from img
    const doc = new jsPDF('landscape');
    doc.setFontSize(20);
    doc.addImage('assets/cotacytResources/loginImages/logotamColor.png', 'png', 9, 7, 57, 28);
    doc.addImage('assets/cotacytResources/loginImages/cecit.png', 'png', 243, 5, 50, 40).setFont('Caviar').setFontSize(18).setTextColor('#646464');
    doc.text('Consejo Tamaulipeco de Ciencia y Tecnología', 91, 37);
    doc.addImage(canvasImg, 'JPEG', 15, 50, 260, 135);
    doc.save('Proyectos-Por-Area.pdf');
  }
}
